import { OperationType } from '../../entities/Statement';

export interface ICreateStatementDTO {
  user_id: string;
  receiver_id?: string;
  type: OperationType;
  amount: number;
  description: string;
}
