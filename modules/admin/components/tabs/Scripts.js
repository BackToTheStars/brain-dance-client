import { Button, Input, Table } from 'antd';
import { useEffect, useState } from 'react';
import { getAdminScriptsRequest, runAdminScriptRequest } from '../../requests';
import Loading from '@/modules/ui/components/common/Loading';
import { CloseOutlined } from '@ant-design/icons';

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

const ScriptsTab = () => {
  const [scripts, setScripts] = useState([]);
  const [activeCommand, setActiveCommand] = useState(null);
  const [paramValues, setParamValues] = useState({});
  const [scriptResult, setScriptResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
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
    setIsLoading(true);
    const { script, command } = activeCommand;
    const params = {};
    commandParams.forEach((param) => {
      const value = paramValues[param.name];
      if (value !== undefined && String(value).trim() !== '') {
        params[param.name] = value;
      }
    });
    runAdminScriptRequest(script.name, command.name, params)
      .then((res) => {
        setScriptResult(res.result);
        setIsLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    getAdminScriptsRequest()
      .then((res) => {
        setScripts(res.items);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  useEffect(() => {
    if (!activeCommand) {
      return;
    }
    setScriptResult(null);
    setParamValues({});
  }, [activeCommand]);

  return (
    <div className="flex gap-2">
      <div className="w-1/3">
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
                  <Button onClick={executeScript} disabled={missingRequired}>
                    execute
                  </Button>
                  {scriptResult !== null && scriptResult !== undefined && (
                    <pre className="whitespace-pre-wrap">
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
