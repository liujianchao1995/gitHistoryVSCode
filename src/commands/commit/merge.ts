import { IGitMergeCommandHandler } from '../../commandHandlers/types';
import { CommitDetails } from '../../common/types';
import { BaseCommitCommand } from '../baseCommitCommand';

export class MergeCommand extends BaseCommitCommand {
    constructor(commit: CommitDetails, private handler: IGitMergeCommandHandler) {
        super(commit);
        this.setTitle(`$(git-merge) 将 (${commit.logEntry.hash.short}) 的提交 合并到当前分支`);
        this.setCommand('git.commit.merge');
        this.setCommandArguments([commit]);
    }
    public execute() {
        this.handler.merge(this.data);
    }
}
