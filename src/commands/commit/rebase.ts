import { IGitRebaseCommandHandler } from '../../commandHandlers/types';
import { CommitDetails } from '../../common/types';
import { BaseCommitCommand } from '../baseCommitCommand';

export class RebaseCommand extends BaseCommitCommand {
    constructor(commit: CommitDetails, private handler: IGitRebaseCommandHandler) {
        super(commit);
        this.setTitle(`$(git-merge) 变基当前分支到此提交 (${commit.logEntry.hash.short})`);
        this.setCommand('git.commit.rebase');
        this.setCommandArguments([commit]);
    }
    public execute() {
        this.handler.rebase(this.data);
    }
}
