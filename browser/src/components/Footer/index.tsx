import * as React from 'react';
import { Button } from 'react-bootstrap';

type FooterProps = {
    canGoForward: boolean;
    canGoBack: boolean;
    goForward: () => void;
    goBack: () => void;
};
export default function Footer(props: FooterProps) {
    return (
        <div id="history-navbar">
            <Button
                bsStyle="primary"
                className={props.canGoBack ? 'navbar-link' : 'navbar-link disabled'}
                onClick={() => props.goBack()}
            >
                <i className="octicon octicon-chevron-left"></i>
                <span>上一页</span>
            </Button>
            <Button
                bsStyle="primary"
                className={props.canGoForward ? 'navbar-link' : 'navbar-link disabled'}
                onClick={() => props.goForward()}
            >
                <span>下一页</span>
                <i className="octicon octicon-chevron-right"></i>
            </Button>
        </div>
    );
}
