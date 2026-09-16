import { Alert, Button, Input, Table } from 'antd';
import { useEffect, useState } from 'react';
import { getAdminScriptsRequest, runAdminScriptRequest } from '../../requests';
import Loading from '@/modules/ui/components/common/Loading';
import { CloseOutlined } from '@ant-design/icons';
import { TID } from '@/config/testIds';

// Скрипты возвращают либо строку, либо список строк (по строке на найденный случай),
// либо произвольный объект. Список строк показываем построчно — иначе отчёт вроде
// «ходы с недопустимым contentType» читается как JSON-массив в кавычках.
const formatScriptResult = (result) => {
  if (typeof result === 'string') return result;
  if (
    Array.isArray(result) &&
    result.every((item) => typeof item === 'string')
  ) {
    return result.length ? result.join('\n') : '(пусто)';
  }
  return JSON.stringify(result, null, 2);
};

const confirmMessage = (script, command, params) => {
  const entries = Object.entries(params);
  return [
    `Run ${script.name} → ${command.name}?`,
    [script.description, command.description].filter(Boolean).join(': '),
    entries.length
      ? `Parameters: ${entries.map(([name, value]) => `${name} = ${value}`).join(', ')}`
      : 'No parameters',
  ]
    .filter(Boolean)
    .join('\n');
};

const ScriptsTab = () => {
  const [scripts, setScripts] = useState([]);
  const [activeCommand, setActiveCommand] = useState(null);
  const [paramValues, setParamValues] = useState({});
  const [scriptResult, setScriptResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  // Запросы идут через adminRequest: отказ приходит исключением с текстом сервера,
  // и его надо показать — раньше он молча уходил в console.log.
  const [listError, setListError] = useState(null);
  const [runError, setRunError] = useState(null);
  const columns = [
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => (
        <div className="flex flex-col gap-2">
          {record.commands.map((command) => (
            <Button
              key={command.name}
              data-test-id={TID.adminScripts.command}
              data-script={record.name}
              data-command={command.name}
              type={
                activeCommand?.script?.name === record.name &&
                activeCommand?.command?.name === command.name
                  ? 'primary'
                  : 'default'
              }
              onClick={() => {
                setActiveCommand({
                  script: record,
                  command: command,
                });
              }}
            >
              {command.name}
            </Button>
          ))}
        </div>
      ),
    },
  ];

  const commandParams = activeCommand?.command?.params || [];
  const missingRequired = commandParams.some(
    (param) => param.required && !String(paramValues[param.name] ?? '').trim(),
  );

  const executeScript = () => {
    const { script, command } = activeCommand;
    const params = {};
    commandParams.forEach((param) => {
      const value = paramValues[param.name];
      if (value !== undefined && String(value).trim() !== '') {
        params[param.name] = value;
      }
    });
    if (command.confirm && !confirm(confirmMessage(script, command, params))) {
      return;
    }
    setIsLoading(true);
    setRunError(null);
    setScriptResult(null);
    runAdminScriptRequest(script.name, command.name, params)
      .then((res) => {
        setIsLoading(false);
        // A command that throws still answers 200: { success: false, result }.
        if (res.success === false) {
          setRunError(formatScriptResult(res.result ?? '') || 'Unknown error');
          return;
        }
        setScriptResult(res.result);
      })
      .catch((err) => {
        setIsLoading(false);
        setRunError(err?.message || String(err));
      });
  };

  useEffect(() => {
    getAdminScriptsRequest()
      .then((res) => {
        setScripts(res.items || []);
      })
      .catch((err) => {
        setListError(err?.message || String(err));
      });
  }, []);

  useEffect(() => {
    if (!activeCommand) {
      return;
    }
    setScriptResult(null);
    setRunError(null);
    setParamValues({});
  }, [activeCommand]);

  return (
    <div className="flex gap-2" data-test-id={TID.adminScripts.root}>
      <div className="w-1/3 flex flex-col gap-2">
        {!!listError && <Alert type="error" showIcon title={listError} />}
        <Table
          className="w-full"
          dataSource={scripts}
          columns={columns}
          rowKey="name"
          pagination={false}
        />
      </div>
      <div className="w-2/3">
        {!!activeCommand && (
          <>
            <div className="flex gap-3 mb-3">
              <div>
                <h2>{activeCommand.script.description}</h2>
                <p>{activeCommand.command.description}</p>
              </div>
              <div>
                <Button onClick={() => setActiveCommand(null)}>
                  <div className="flex-center">
                    <CloseOutlined />
                  </div>
                </Button>
              </div>
            </div>
            {commandParams.length > 0 && (
              <div className="flex flex-col gap-2 mb-3">
                {commandParams.map((param) => (
                  <div key={param.name} className="flex flex-col gap-1">
                    <label>
                      {param.description || param.name}
                      {param.required && (
                        <span className="text-red-500"> *</span>
                      )}
                    </label>
                    <Input
                      data-test-id={TID.adminScripts.param}
                      data-param={param.name}
                      value={paramValues[param.name] ?? ''}
                      placeholder={param.name}
                      onChange={(e) =>
                        setParamValues((prev) => ({
                          ...prev,
                          [param.name]: e.target.value,
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
            )}
            <div>
              {isLoading && <Loading />}
              {!isLoading && (
                <>
                  <Button
                    data-test-id={TID.adminScripts.execute}
                    onClick={executeScript}
                    disabled={missingRequired}
                  >
                    execute
                  </Button>
                  {!!runError && (
                    <Alert
                      className="mt-2"
                      data-test-id={TID.adminScripts.error}
                      type="error"
                      showIcon
                      title={runError}
                    />
                  )}
                  {scriptResult !== null && scriptResult !== undefined && (
                    <pre
                      className="whitespace-pre-wrap"
                      data-test-id={TID.adminScripts.result}
                    >
                      {formatScriptResult(scriptResult)}
                    </pre>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ScriptsTab;
