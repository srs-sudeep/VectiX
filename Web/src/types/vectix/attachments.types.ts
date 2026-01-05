/**
 * Attachment Types - Personal Finance (Bills/Receipts)
 */

export interface Attachment {
  id: string;
  user_id: string;
  file_url: string;
  type: 'bill' | 'receipt';
  extracted_text?: string;
  linked_transaction_id?: string;
  created_at: string;
  updated_at: string;
}

export interface AttachmentCreate {
  file_url: string;
  type: 'bill' | 'receipt';
  extracted_text?: string;
  linked_transaction_id?: string;
}

export interface AttachmentUpdate {
  type?: string;
  extracted_text?: string;
  linked_transaction_id?: string;
}

