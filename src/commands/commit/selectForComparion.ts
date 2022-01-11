import { IGitCompareCommandHandler } from '../../commandHandlers/types';
import { CommitDetails } from '../../common/types';
import { BaseCommitCommand } from '../baseCommitCommand';

export class SelectForComparison extends BaseCommitCommand {
    constructor(commit: CommitDetails, private handler: IGitCompareCommandHandler) {
        super(commit);
        const committer = `${commit.logEntry.author!.name} <${
            commit.logEntry.author!.email
        }> on ${commit.logEntry.author!.date!.toLocaleString()}`;
        this.setTitle(`$(git-compare) 与此版本 (${committer})进行比较`);
        // this.setDetail(commit.logEntry.subject);
        this.setCommand('git.commit.compare.selectForComparison');
        this.setCommandArguments([CommitDetails]);
    }
    public execute() {
        this.handler.select(this.data);
    }
}
