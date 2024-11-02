import { useEffect, useState } from 'react';
import cn from 'classnames';
import { SegmentedControl } from '@mantine/core';
import CodeMirror from '@uiw/react-codemirror';
import { githubLight } from '@uiw/codemirror-theme-github';
import { json } from '@codemirror/lang-json';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import { IconGithub } from './icons';

function togglePanelDirection(width: number) {
    return width < 640 ? 'vertical' : 'horizontal';
}

export default function App() {
    const [activeKey, setActiveKey] = useState('AST');
    const [panelDirection, setPanelDirection] = useState<'vertical' | 'horizontal'>(() => togglePanelDirection(window.innerWidth));

    useEffect(() => {
        const handleResize = () => setPanelDirection(togglePanelDirection(window.innerWidth));
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <PanelGroup direction={panelDirection} className="!h-screen">
            <Panel minSize={20}>
                <header className="flex justify-between items-center border-b h-10 pl-4 pr-2">
                    <div className="flex items-center">
                        <img className="w-5 mr-2" src="/favicon.svg" alt="Website Logo" />
                        <h1 className="font-mono">
                            Monkey Lang Playground
                        </h1>
                    </div>
                    <div className="">
                        <SegmentedControl
                            value={activeKey}
                            onChange={setActiveKey}
                            data={['AST', 'OUTPUT']}
                            classNames={{ control: 'w-20' }}
                            size="xs"
                        />
                    </div>
                </header>
                <div
                    className={cn(
                        'overflow-y-auto',
                        {
                            'h-[calc(100vh-40px)]': panelDirection === 'horizontal',
                            'h-[calc(100%-40px)]': panelDirection === 'vertical',
                        },
                    )}
                >
                    <CodeMirror
                        className="min-h-full input"
                        theme={githubLight}
                        basicSetup={{ tabSize: 4 }}
                    />
                </div>
            </Panel>
            <PanelResizeHandle
                className={cn(
                    'bg-slate-100',
                    {
                        'w-0.5': panelDirection === 'horizontal',
                        'h-0.5': panelDirection === 'vertical',
                    },
                )}
            />
            <Panel minSize={20}>
                <div
                    className={cn(
                        'overflow-y-auto',
                        {
                            'hidden': activeKey !== 'AST',
                            'h-screen': panelDirection === 'horizontal',
                            'h-full': panelDirection === 'vertical',
                        },
                    )}
                >
                    <CodeMirror
                        value=""
                        className="min-h-full ast"
                        extensions={[json()]}
                        theme={githubLight}
                    />
                </div>
                <div className={cn('h-screen overflow-y-auto bg-slate-50', { hidden: activeKey !== 'OUTPUT' })}>
                </div>
                <a className="fixed bottom-2 right-2 rounded bg-white p-2 text-xl shadow" href="https://github.com/banqinghe/monkey-interpreter-ts">
                    <IconGithub />
                </a>
            </Panel>
        </PanelGroup>
    );
}
