import { OperationType, Statement } from '../../entities/Statement';
import { ICreateStatementDTO } from '../../useCases/createStatement/ICreateStatementDTO';
import { IGetBalanceDTO } from '../../useCases/getBalance/IGetBalanceDTO';
import { IGetStatementOperationDTO } from '../../useCases/getStatementOperation/IGetStatementOperationDTO';
import { IStatementsRepository } from '../IStatementsRepository';

export class InMemoryStatementsRepository implements IStatementsRepository {
  private statements: Statement[] = [];

  async create({
    user_id,
    receiver_id,
    amount,
    description,
    type,
  }: ICreateStatementDTO): Promise<Statement> {
    if (type === OperationType.TRANSFER) {
      const senderStatement = new Statement();

      Object.assign(senderStatement, { user_id, amount, description, type });

      const receiverStatement = new Statement();

      Object.assign(receiverStatement, {
        user_id: receiver_id,
        sender_id: user_id,
        amount,
        description,
        type,
      });

      this.statements.push(senderStatement, receiverStatement);

      return senderStatement;
    }

    const statement = new Statement();

    Object.assign(statement, { user_id, amount, description, type });

    this.statements.push(statement);

    return statement;
  }

  async findStatementOperation({
    statement_id,
    user_id,
  }: IGetStatementOperationDTO): Promise<Statement | undefined> {
    return this.statements.find(
      operation =>
        operation.id === statement_id && operation.user_id === user_id,
    );
  }

  async getUserBalance({
    user_id,
    with_statement = false,
  }: IGetBalanceDTO): Promise<
    { balance: number } | { balance: number; statement: Statement[] }
  > {
    const statement = this.statements.filter(
      operation => operation.user_id === user_id,
    );

    const balance = statement.reduce((acc, operation) => {
      let total = acc;
      switch (operation.type) {
        case OperationType.DEPOSIT:
          total += Number(operation.amount);
          break;
        case OperationType.WITHDRAW:
          total -= Number(operation.amount);
          break;
        case OperationType.TRANSFER:
          if (operation.sender_id) {
            total += Number(operation.amount);
          } else {
            total -= Number(operation.amount);
          }
          break;
        default:
          break;
      }

      return total;
    }, 0);

    if (with_statement) {
      return {
        statement,
        balance,
      };
    }

    return { balance };
  }
}
