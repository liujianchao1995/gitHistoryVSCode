import * as React from 'react';
import { connect } from 'react-redux';
import { ResultActions } from '../../../actions/results';
import { LogEntry, Ref } from '../../../definitions';
import { LogEntriesState, RootState } from '../../../reducers';
import BranchGraph from '../BranchGraph';
import LogEntryList from '../LogEntryList';
import Dialog, { DialogType } from '../../Dialog';
import { IConfiguration } from 'src/reducers/vscode';

type LogViewProps = {
    logEntries: LogEntriesState;
    configuration: IConfiguration;
    commitsRendered: typeof ResultActions.commitsRendered;
    onViewCommit: typeof ResultActions.selectCommit;
    actionCommit: typeof ResultActions.actionCommit;
    actionRef: typeof ResultActions.actionRef;
    getPreviousCommits: typeof ResultActions.getPreviousCommits;
    getNextCommits: typeof ResultActions.getNextCommits;
};

interface LogViewState {}

class LogView extends React.Component<LogViewProps, LogViewState> {
    private ref: React.RefObject<LogEntryList>;
    private dialog: Dialog;
    constructor(props?: LogViewProps, context?: any) {
        super(props, context);
        // this.state = { height: '', width: '', itemHeight: 0 };
        this.ref = React.createRef<LogEntryList>();
    }

    public componentDidUpdate() {
        const el = this.ref.current.ref;

        if (this.props.logEntries.selected) {
            return;
        }

        if (
            el.hasChildNodes() &&
            this.props.logEntries &&
            !this.props.logEntries.isLoading &&
            !this.props.logEntries.isLoadingCommit &&
            Array.isArray(this.props.logEntries.items) &&
            this.props.logEntries.items.length > 0
        ) {
            // use the total height to be more accurate in positioning the dots from BranchGraph
            const totalHeight = el.offsetHeight;
            const logEntryHeight = totalHeight / this.props.logEntries.items.length;
            this.props.commitsRendered(logEntryHeight);
        }
    }

    public render() {
        return (
            <div className="log-view" id="scrollCnt">
                <BranchGraph></BranchGraph>
                <LogEntryList
                    ref={this.ref}
                    logEntries={this.props.logEntries.items}
                    onAction={this.onAction}
                    onRefAction={this.onRefAction}
                    onViewCommit={this.onViewCommit}
                ></LogEntryList>
                <Dialog ref={r => (this.dialog = r)} onOk={this.onDialogOk.bind(this)} />
            </div>
        );
    }

    public onViewCommit = (logEntry: LogEntry) => {
        this.props.onViewCommit(logEntry.hash.full);
    };

    public onRefAction = (logEntry: LogEntry, ref: Ref, name: string) => {
        switch (name) {
            case 'removeTag':
                this.dialog.showConfirm(`删除标签 ${ref.name}?`, `确定要删除 ${ref.name} 标签吗?`, DialogType.Warning, {
                    logEntry,
                    ref,
                    name,
                });
                break;
            case 'removeBranch':
                this.dialog.showConfirm(`删除分支 ${ref.name}?`, `真的要删除 ${ref.name} 分支吗?`, DialogType.Warning, {
                    logEntry,
                    ref,
                    name,
                });
                break;
            case 'checkoutBranch':
                this.dialog.showConfirm(
                    `切换到分支 ${ref.name}?`,
                    `确定要切换到 ${ref.name} 分支吗?`,
                    DialogType.Info,
                    { logEntry, ref, name },
                );
                break;
            case 'removeRemote':
                this.dialog.showConfirm(
                    `删除远程分支 ${ref.name}?`,
                    `真的要删除远程分支 ${ref.name} 吗?`,
                    DialogType.Warning,
                    { logEntry, ref, name },
                );
                break;
        }
    };

    public onAction = (entry: LogEntry, name = '') => {
        switch (name) {
            case 'newtag':
                this.dialog.showInput(
                    `在 ${entry.hash.short} 创建一个新标签`,
                    `<strong>${entry.subject}</strong><br />${entry.author.name} on ${entry.author.date.toISOString()}`,
                    '在这里输入标签名',
                    DialogType.Info,
                    { entry, name },
                );
                break;
            case 'newbranch':
                this.dialog.showInput(
                    `在 ${entry.hash.short} 创建一个新分支`,
                    `<strong>${entry.subject}</strong><br />${entry.author.name} on ${entry.author.date.toISOString()}`,
                    '在此处输入分支名称',
                    DialogType.Info,
                    { entry, name },
                );
                break;
            case 'reset_soft':
                this.dialog.showConfirm(
                    `软重置到 ${entry.hash.short}?(git reset --soft)`,
                    `<p><strong>${entry.subject}</strong><br />${
                        entry.author.name
                    } on ${entry.author.date.toISOString()}</p><small>所有受影响的文件将合并并保存在本地工作区中</small>`,
                    DialogType.Info,
                    { entry, name },
                );
                break;
            case 'reset_hard':
                this.dialog.showConfirm(
                    `硬重置到 ${entry.hash.short}?(git reset --hard)`,
                    `<p><strong>${entry.subject}</strong><br />${
                        entry.author.name
                    } on ${entry.author.date.toISOString()}</p><div>此操作不可逆，未提交的本地文件将被删除！</div>`,
                    DialogType.Warning,
                    { entry, name },
                );
                break;
            default:
                this.props.actionCommit(entry, name);
                break;
        }
    };

    public onDialogOk = (sender: HTMLButtonElement, args: any) => {
        switch (args!.name) {
            case 'newbranch':
            case 'newtag':
                this.props.actionCommit(args.entry, args.name, this.dialog.getValue());
                break;
            case 'reset_soft':
            case 'reset_hard':
                this.props.actionCommit(args.entry, args.name);
                break;
            case 'removeRemote':
            case 'checkoutBranch':
            case 'removeBranch':
            case 'removeTag':
                this.props.actionRef(args.logEntry, args.ref, args.name);
                break;
        }
    };
}
function mapStateToProps(state: RootState, wrapper: { logEntries: LogEntriesState; configuration: IConfiguration }) {
    return {
        logEntries: wrapper.logEntries,
        configuration: state.vscode.configuration,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        commitsRendered: (height: number) => dispatch(ResultActions.commitsRendered(height)),
        onViewCommit: (hash: string) => dispatch(ResultActions.selectCommit(hash)),
        actionCommit: (logEntry: LogEntry, name: string, value = '') =>
            dispatch(ResultActions.actionCommit(logEntry, name, value)),
        actionRef: (logEntry: LogEntry, ref: Ref, name: string) =>
            dispatch(ResultActions.actionRef(logEntry, ref, name)),
        getNextCommits: () => dispatch(ResultActions.getNextCommits()),
        getPreviousCommits: () => dispatch(ResultActions.getPreviousCommits()),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(LogView);
