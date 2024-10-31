import { useState } from 'react';
import cn from 'classnames';
import { SegmentedControl } from '@mantine/core';
import CodeMirror from '@uiw/react-codemirror';
import { githubLight } from '@uiw/codemirror-theme-github';
import { json } from '@codemirror/lang-json';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';

export default function App() {
    const [activeKey, setActiveKey] = useState('AST');

    console.log(activeKey);

    return (
        <PanelGroup direction="horizontal" className="h-screen">
            <Panel minSize={20}>
                {/* <Header /> */}
                <header className="flex justify-between items-center border-b h-10 pl-4 pr-2">
                    <div className="flex items-center">
                        <img className="w-5 mr-2" src="/favicon.svg" alt="Website Logo" />
                        <h1 className="font-mono">
                            Monkey Lang Playground
                        </h1>
                        {/* <a className="ml-2 text-[10px] font-mono" href="https://github.com/banqinghe/monkey-interpreter-ts">GitHub</a> */}
                    </div>
                    <div className="">
                        <SegmentedControl
                            value={activeKey}
                            onChange={setActiveKey}
                            data={['AST', 'OUTPUT']}
                            classNames={{ control: 'w-24' }}
                            size="xs"
                        />
                    </div>
                </header>
                <div className="h-[calc(100vh-40px)] overflow-y-auto">
                    <CodeMirror
                        className="min-h-full input"
                        theme={githubLight}
                        basicSetup={{ tabSize: 4 }}
                    />
                </div>
            </Panel>
            <PanelResizeHandle className="w-0.5 bg-slate-100" />
            <Panel minSize={20}>
                <div className={cn('h-screen overflow-y-auto', { hidden: activeKey !== 'AST' })}>
                    <CodeMirror
                        value=""
                        className="min-h-full ast"
                        extensions={[json()]}
                        theme={githubLight}
                    />
                </div>
                <div className={cn('h-screen overflow-y-auto bg-slate-50', { hidden: activeKey !== 'OUTPUT' })}>
                </div>
            </Panel>
        </PanelGroup>
    );
}
