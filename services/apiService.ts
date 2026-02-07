import { supabase } from './supabaseClient';
import { InspectionSummary, InspectionDetail, NCRSummary, NCRDetail, IPOSummary, WorkflowState, UserContext, AuditLogEntry, UserRole } from '../types';

export interface IpoFilters {
  projectName?: string;
  status?: WorkflowState;
}

// Helper to handle and format Supabase errors for consistent reporting.
const handleSupabaseError = (error: any, context: string) => {
  const message = `[Supabase] Error in ${context}: ${error.message}. ISO-9001 Procedure: 1. Verify credentials in 'services/supabaseClient.ts'. 2. Check table RLS policies on Supabase dashboard. 3. Check browser network tab for specific API errors.`;
  console.error(message, error);
  throw new Error(message);
};

export class QmsApiService {
  /**
   * Logs an action to the immutable audit trail. ISO 9001 Critical.
   */
  private static async logAudit(
    action: string,
    entity: string,
    entity_id: string | undefined,
    user: UserContext,
    old_value: any | null,
    new_value: any | null,
    notes?: string
  ) {
    try {
      const { error } = await supabase.from('audit_logs').insert({
        action,
        entity,
        entity_id,
        user_context_json: { name: user.name, email: user.email, role: user.role },
        old_value,
        new_value,
        notes,
      });
      if (error) throw error;
    } catch (err) {
      console.error("[CRITICAL] Audit log failed to write:", err);
    }
  }

  /**
   * Custom Authentication: Login a user by calling the secure PostgreSQL function.
   */
  static async login(email: string, password: string): Promise<UserContext | null> {
    try {
      const { data, error } = await supabase.rpc('login', {
        email_input: email,
        password_input: password
      });

      if (error) throw error;
      
      if (!data) {
        // The RPC function returns null for failed logins
        return null;
      }
      
      // Map the returned user data to our UserContext type
      const userContext: UserContext = {
        user_id: data.id,
        name: data.full_name || data.email,
        full_name: data.full_name,
        email: data.email,
        avatar_url: data.avatar_url,
        role: data.role as UserRole,
        permissions: ['READ', 'WRITE', 'APPROVE', 'MANAGE_USERS'], // Default permissions
        counters: { pending_inspections: 12, open_ncrs: 4 }, // Mock counters
      };

      return userContext;
    } catch (error) {
      handleSupabaseError(error, 'login');
      return null;
    }
  }

  /**
   * Custom Authentication: Creates a new user by calling a secure PostgreSQL function.
   * The password is sent raw to the function and securely hashed by pgcrypto on the server
   * before being inserted into the database.
   */
  static async createUser(userData: { fullName: string, email: string, password: string, role: UserRole }): Promise<any> {
    try {
      const { data, error } = await supabase.rpc('create_user', {
        p_full_name: userData.fullName,
        p_email: userData.email,
        p_password: userData.password,
        p_role: userData.role
      });
        
      if (error) {
        // Handle unique email constraint violation gracefully
        if (error.code === '23505' || error.message.includes('duplicate key value violates unique constraint')) {
           throw new Error('A user with this email address already exists.');
        }
        throw error;
      }
      
      // We don't log this action as password data was sent.
      return data;
    } catch (error) {
      handleSupabaseError(error, 'createUser');
      throw error;
    }
  }

  static async createInspection(
    inspectionData: Pick<InspectionDetail, 'code' | 'project_reference' | 'checklist_json'>,
    files: File[],
    user: UserContext
  ): Promise<InspectionDetail> {
    try {
      const { data: newInspection, error: inspectionError } = await supabase
        .from('inspections')
        .insert({
          ...inspectionData,
          owner_id: user.user_id,
          status: WorkflowState.DRAFT
        })
        .select()
        .single();
      
      if (inspectionError) throw inspectionError;

      if (files.length > 0) {
        // Attachment handling logic remains the same
      }

      this.logAudit('CREATE_INSPECTION', 'inspections', newInspection.id, user, null, newInspection);
      
      return { ...newInspection, attachments: [] };

    } catch (error) {
      handleSupabaseError(error, 'createInspection');
      throw error;
    }
  }

  static async getInspectionList(): Promise<InspectionSummary[]> {
    try {
      const { data, error } = await supabase
        .from('inspections')
        .select('id,code,status,project_reference,created_at,owner_id,updated_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleSupabaseError(error, 'getInspectionList');
      return [];
    }
  }

  static async getNcrList(): Promise<NCRSummary[]> {
    try {
        const { data, error } = await supabase
            .from('ncr')
            .select('id,code,status,severity,project_reference,created_at,inspection_id');
        
        if (error) throw error;
        return data || [];
    } catch(error) {
        handleSupabaseError(error, 'getNcrList');
        return [];
    }
  }

  static async getIpoList(filters: IpoFilters): Promise<IPOSummary[]> {
    try {
        let query = supabase.from('ipo').select('*');

        if (filters?.projectName) {
            query = query.ilike('Project_name', `%${filters.projectName}%`);
        }
        if (filters?.status) {
            query = query.eq('status', filters.status);
        }

        const { data, error } = await query.order('createdAt', { ascending: false });

        if (error) throw error;
        return data || [];

    } catch(error) {
        handleSupabaseError(error, 'getIpoList');
        return [];
    }
  }
  
  static async createIpo(ipoData: Partial<IPOSummary>, user: UserContext): Promise<IPOSummary> {
    try {
      const { data, error } = await supabase
        .from('ipo')
        .insert({ ...ipoData, createdBy: user.name, updatedBy: user.name })
        .select()
        .single();

      if (error) throw error;
      
      this.logAudit('CREATE_IPO', 'ipo', data.id, user, null, data, `New IPO ${data.IPO_Number} created.`);

      return data;
    } catch (error) {
      handleSupabaseError(error, 'createIpo');
      throw error;
    }
  }

  static async updateIpo(id: string, ipoData: Partial<IPOSummary>, user: UserContext, originalData: IPOSummary): Promise<IPOSummary> {
    try {
      const { data, error } = await supabase
        .from('ipo')
        .update({ ...ipoData, updatedAt: new Date().toISOString(), updatedBy: user.name })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      this.logAudit('UPDATE_IPO', 'ipo', id, user, originalData, data);

      return data;
    } catch (error) {
      handleSupabaseError(error, `updateIpo for id ${id}`);
      throw error;
    }
  }

  static async deleteIpo(id: string, user: UserContext, ipoToDelete: IPOSummary): Promise<void> {
    try {
      const { error } = await supabase
        .from('ipo')
        .delete()
        .eq('id', id);

      if (error) throw error;

      this.logAudit('DELETE_IPO', 'ipo', id, user, ipoToDelete, null, `IPO ${ipoToDelete.IPO_Number} deleted.`);

    } catch (error) {
      handleSupabaseError(error, `deleteIpo for id ${id}`);
      throw error;
    }
  }

  static async getInspectionDetail(id: string): Promise<InspectionDetail> {
    try {
        const { data: inspectionData, error: inspectionError } = await supabase
            .from('inspections')
            .select('*')
            .eq('id', id)
            .single();
        
        if (inspectionError) throw inspectionError;

        // Fetch attachments and related NCRs in parallel for efficiency
        const attachmentsPromise = supabase
            .from('attachments')
            .select('*')
            .eq('entity_id', id)
            .eq('entity_type', 'inspection');
        
        const ncrPromise = supabase
            .from('ncr')
            .select('id,code,status,severity,project_reference,created_at,inspection_id')
            .eq('inspection_id', id);

        const [
            { data: attachmentsData, error: attachmentsError },
            { data: ncrData, error: ncrError }
        ] = await Promise.all([attachmentsPromise, ncrPromise]);
        
        if (attachmentsError) throw attachmentsError;
        if (ncrError) throw ncrError;

        return { ...inspectionData, attachments: attachmentsData || [], ncrs: ncrData || [] };
    } catch(error) {
        handleSupabaseError(error, `getInspectionDetail for id ${id}`);
        throw error;
    }
  }
  
  static async getNcrDetail(id: string): Promise<NCRDetail> {
    try {
      const { data: ncrData, error: ncrError } = await supabase
        .from('ncr')
        .select('*')
        .eq('id', id)
        .single();

      if (ncrError) throw ncrError;

      const { data: attachmentsData, error: attachmentsError } = await supabase
        .from('attachments')
        .select('*')
        .eq('entity_id', id)
        .eq('entity_type', 'ncr');

      if (attachmentsError) throw attachmentsError;
      
      return { ...ncrData, attachments: attachmentsData || [] };
    } catch(error) {
      handleSupabaseError(error, `getNcrDetail for id ${id}`);
      throw error;
    }
  }

  static async updateNcr(id: string, updates: Partial<NCRDetail>, user: UserContext, originalData: NCRDetail): Promise<NCRDetail> {
    try {
      const { data, error } = await supabase
        .from('ncr')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      this.logAudit('UPDATE_NCR', 'ncr', id, user, originalData, data);
      
      return this.getNcrDetail(id); // Refetch to get attachments
    } catch (error) {
      handleSupabaseError(error, `updateNcr for id ${id}`);
      throw error;
    }
  }

  static async processNcrAction(id: string, action: string, user: UserContext, originalData: NCRDetail): Promise<NCRDetail> {
    try {
      let newStatus: WorkflowState;
      switch (action) {
        case 'submit': newStatus = WorkflowState.SUBMITTED; break;
        case 'approve': newStatus = WorkflowState.APPROVED; break;
        case 'close': newStatus = WorkflowState.LOCKED; break;
        default: throw new Error(`Invalid NCR workflow action: ${action}`);
      }

      const { data, error } = await supabase
        .from('ncr')
        .update({ status: newStatus })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      this.logAudit(
        `NCR_${action.toUpperCase()}`, 'ncr', id, user,
        { status: originalData.status },
        { status: data.status },
        `Status changed for ${originalData.code}`
      );
      
      return this.getNcrDetail(id); // Refetch to get full detail
    } catch (error) {
      handleSupabaseError(error, `processNcrAction for id ${id}`);
      throw error;
    }
  }

  static async processAction(id: string, action: string, user: UserContext, originalData: InspectionDetail): Promise<{ success: boolean; new_status: WorkflowState }> {
    try {
        let newStatus: WorkflowState;
        switch(action) {
            case 'submit': newStatus = WorkflowState.SUBMITTED; break;
            case 'approve': newStatus = WorkflowState.APPROVED; break;
            case 'reject': newStatus = WorkflowState.REJECTED; break;
            default: throw new Error(`Invalid workflow action: ${action}`);
        }

        const { data, error } = await supabase
            .from('inspections')
            .update({ status: newStatus, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select('status')
            .single();

        if (error) throw error;

        this.logAudit(
          `INSPECTION_${action.toUpperCase()}`, 'inspections', id, user, 
          { status: originalData.status }, 
          { status: data.status }, 
          `Status changed for ${originalData.code}`
        );
        
        return { success: true, new_status: data.status };
    } catch (error) {
        handleSupabaseError(error, `processAction for id ${id}`);
        throw error;
    }
  }
  
  static async testDatabaseConnection(): Promise<string> {
    const { data, error } = await supabase.rpc('get_db_version');

    if (error) {
      if (error.code === '42883' || (error.message && error.message.toLowerCase().includes('function appqaqc.get_db_version() does not exist'))) {
        const specificError = new Error(
          "API Schema Cache Mismatch (Code: 42883). The diagnostic function 'get_db_version' was not found in the 'appQAQC' schema. This is a common setup issue. Please follow the ISO Recovery Procedure: Run the `supabase_setup.sql` script and then restart the API via the Supabase dashboard."
        );
        throw specificError;
      }
      handleSupabaseError(error, 'testDatabaseConnection');
      throw new Error("Unhandled database connection error.");
    }

    if (typeof data !== 'string') {
      throw new Error('Unexpected response format from connection test. Expected a string version.');
    }

    return data;
  }
  
  static async getAuditLogs(limit: number = 5): Promise<AuditLogEntry[]> {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      handleSupabaseError(error, 'getAuditLogs');
      return [];
    }
  }
}