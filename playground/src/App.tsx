import { useEffect, useState, useDeferredValue } from 'react';
import cn from 'classnames';
import { Alert, SegmentedControl, NativeSelect } from '@mantine/core';
import CodeMirror from '@uiw/react-codemirror';
import { githubLight } from '@uiw/codemirror-theme-github';
import { javascript } from '@codemirror/lang-javascript';
import { json } from '@codemirror/lang-json';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import { IconError, IconGithub } from './icons';
import { evaluate } from './monkey';
import examples from './examples';

function togglePanelDirection(width: number) {
    return width < 640 ? 'vertical' : 'horizontal';
}

const exampleKeys = Object.keys(examples);

const defaultCode = examples[exampleKeys[0]];

export default function App() {
    const [activeKey, setActiveKey] = useState('OUTPUT');
    const [panelDirection, setPanelDirection] = useState<'vertical' | 'horizontal'>(() => togglePanelDirection(window.innerWidth));

    const [code, setCode] = useState(defaultCode);
    const [ast, setAst] = useState('');
    const [errMsg, setErrMsg] = useState('');
    const [output, setOutput] = useState('');
    const [time, setTime] = useState(0);

    const deferredCode = useDeferredValue(code);

    useEffect(() => {
        let astStr = '{}';
        let err;
        let evaluatedValue = '';

        try {
            const { ast, output, errors, time } = evaluate(deferredCode);
            astStr = JSON.stringify(ast, null, 2);
            evaluatedValue = output;
            setTime(time);
            if (errors.length > 0) {
                throw new Error(errors.join('\n'));
            }
        } catch (e: any) {
            err = e;
        }

        if (err) {
            // console.error(err.toString());
            setErrMsg(err.toString());
            setOutput(err.toString());
        } else {
            setErrMsg('');
            setOutput(evaluatedValue);
        }

        setAst(astStr);
    }, [deferredCode]);

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
                        <h1 className="font-mono truncate">
                            Monkey Lang Playground
                        </h1>
                        <NativeSelect
                            classNames={{ root: 'ml-4' }}
                            size="xs"
                            data={exampleKeys}
                            onChange={e => {
                                setCode(examples[e.target.value] || defaultCode);
                                console.log(e.target.value);
                            }}
                        />
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
                        value={code}
                        extensions={[javascript()]}
                        onChange={val => setCode(val)}
                    />
                </div>
                {Boolean(errMsg) && (
                    <Alert
                        className="bg-red-200 fixed bottom-2 left-1 right-1 sm:left-10 sm:bottom-2 sm:max-w-[450px]"
                        variant="light"
                        icon={<IconError className="w-full h-full text-red-600" />}
                    >
                        {errMsg}
                    </Alert>
                )}
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
                        readOnly
                        value={ast}
                        className="min-h-full ast"
                        extensions={[json()]}
                        theme={githubLight}
                    />
                </div>
                <div
                    className={cn(
                        'h-screen p-4 pb-12 overflow-auto',
                        { hidden: activeKey !== 'OUTPUT' },
                    )}
                >
                    <pre>{output}</pre>
                </div>
                <div className="fixed bottom-0 w-full px-4 py-2 font-mono bg-white border-t">
                    Execution completed in
                    {' '}
                    {time}
                    ms
                </div>
                <a
                    className="fixed bottom-12 right-6 rounded bg-white p-2 text-xl shadow"
                    href="https://github.com/banqinghe/monkey-interpreter-ts"
                    target="_blank"
                >
                    <IconGithub />
                </a>
            </Panel>
        </PanelGroup>
    );
}
