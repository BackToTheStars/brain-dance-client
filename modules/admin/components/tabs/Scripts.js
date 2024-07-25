import { Button, Table } from 'antd';
import { useEffect, useState } from 'react';
import { getAdminScriptsRequest, runAdminScriptRequest } from '../../requests';
import Loading from '@/modules/ui/components/common/Loading';
import { CloseOutlined } from '@ant-design/icons';

const ScriptsTab = () => {
  const [scripts, setScripts] = useState([]);
  const [activeCommand, setActiveCommand] = useState(null);
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

  const executeScript = () => {
    setIsLoading(true);
    const { script, command } = activeCommand;
    runAdminScriptRequest(script.name, command.name)
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
            <div>
              {isLoading && <Loading />}
              {!isLoading && (
                <>
                  <Button onClick={executeScript}>execute</Button>
                  {!!scriptResult &&
                    (typeof scriptResult === 'string' ? (
                      <pre>{scriptResult}</pre>
                    ) : (
                      <pre>{JSON.stringify(scriptResult, null, 2)}</pre>
                    ))}
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
