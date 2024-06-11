import { ROLES, ROLE_GAME_OWNER, ROLE_GAME_VISITOR } from '@/config/user';
import { Button, Table } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import {
  checkGameRequest,
  loadGamesByHashesRequest,
} from '../../redux/requests';
import { useDispatch, useSelector } from 'react-redux';
import { StarFilled, StarOutlined } from '@ant-design/icons';
import { addGame, removeGame, updateActiveCode } from '@/modules/settings/redux/actions';
import { removeGameInfo } from '@/modules/user/contexts/UserContext';
import { getGameUserTokenRequest } from '@/modules/game/requests';

const GAME_KEY_PREFIX = 'game_'; // @todo: перенести в UserContext ?

const AccessGames = () => {
  const dispatch = useDispatch();
  const columns = useMemo(() => {
    return [
      {
        title: 'Hash',
        dataIndex: 'hash',
      },
      {
        title: 'Name',
        dataIndex: 'name',
        width: 300,
      },
      {
        title: 'Saved Codes Access',
        dataIndex: 'gameCodesAccess',
        width: 400,
        render: (gameCodesAccess, record) => {
          // return ROLES[role]?.name;
          if (!gameCodesAccess) return null;
          return (
            <div className="flex flex-col gap-3">
              {gameCodesAccess.codes.map(({ nickname, role, code, active }) => {
                return (
                  <div key={code} className="flex gap-2 items-center">
                    {active ? (
                      <StarFilled
                        onClick={() =>
                          dispatch(
                            updateActiveCode(gameCodesAccess.hash, code, false),
                          )
                        }
                      />
                    ) : (
                      <StarOutlined
                        onClick={() =>
                          dispatch(
                            updateActiveCode(gameCodesAccess.hash, code, true),
                          )
                        }
                      />
                    )}{' '}
                    <b>
                      {ROLES[role]?.name} {code}
                    </b>{' '}
                    {nickname}
                  </div>
                );
              })}
              {/* <pre>{JSON.stringify(gameCodesAccess.codes, null, 2)}</pre> */}
              {/* {!record.name && (
                <Button
                  onClick={() => {
                    // getGameUserTokenRequest(code, nickname);
                    // checkGameRequest(
                    //   gameAuthAccess.info.hash,
                    //   gameAuthAccess.token,
                    // ).then((data) => {
                    //   if (data.item) {
                    //     alert(`game ${data.item.gameId} checked`);
                    //   } else if (data.message) {
                    //     alert(data.message);
                    //   }
                    // });
                  }}
                >
                  Check
                </Button>
              )} */}
            </div>
          );
        },
      },
      {
        title: 'Game Auth Access',
        dataIndex: 'gameAuthAccess',
        width: 400,
        render: (gameAuthAccess, record) => {
          if (!gameAuthAccess) return null;
          const { role, nickname, hash } = gameAuthAccess.info;
          return (
            <div className="flex flex-col gap-3">
              <div>
                <b>{ROLES[role]?.name}</b> {nickname}
              </div>
              <div className="flex gap-2">
                {
                  !!dStorageFullGames[hash] && !record.gameCodesAccess && (
                    <p>
                      {/* Game is available by hash */}
                      <Button
                        onClick={() => {
                          dispatch(
                            addGame({
                              hash,
                              nickname: ROLES[ROLE_GAME_VISITOR].name,
                              role: ROLE_GAME_VISITOR,
                              code: hash,
                            }),
                          );
                        }}
                      >
                        Get Code
                      </Button>
                    </p>
                  )
                  // : (
                  //   role === ROLE_GAME_OWNER && (
                  //     <p>
                  //       As the owner you can generate a visitor code:
                  //       <Button onClick={() => alert('Not implemented yet')}>
                  //         Get Code
                  //       </Button>
                  //     </p>
                  //   )
                  // )
                }
                {!record.name && (
                  <Button
                    onClick={() => {
                      checkGameRequest(
                        gameAuthAccess.info.hash,
                        gameAuthAccess.token,
                      ).then((data) => {
                        if (data.item) {
                          alert(`game ${data.item.gameId} checked`);
                        } else if (data.message) {
                          alert(data.message);
                        }
                      });
                    }}
                  >
                    Check
                  </Button>
                )}
                <Button
                  onClick={() => {
                    removeGameInfo(gameAuthAccess.info.hash);
                    loadGamesFromLocalStorage();
                  }}
                >
                  Logout
                </Button>
              </div>
              {/* <pre style={{ maxWidth: '400px', overflowX: 'auto' }}>
                {JSON.stringify(gameAuthAccess, null, 2)}
              </pre> */}
            </div>
          );
        },
      },
    ];
  });
  const [storageGames, setStorageGames] = useState([]);
  const [dStorageFullGames, setDStorageFullGames] = useState({});
  const settingsGames = useSelector((s) => s.settings.games);
  const lobbyGames = useSelector((s) => s.lobby.games);
  const dataSource = useMemo(() => {
    const dLobbyGames = lobbyGames.reduce((acc, obj) => {
      return {
        ...acc,
        [obj.hash]: obj,
      };
    }, {});
    const dSettingsHashes = settingsGames.reduce((acc, obj) => {
      return {
        ...acc,
        [obj.hash]: obj,
      };
    }, {});
    const dStorageHashes = storageGames.reduce((acc, obj) => {
      return {
        ...acc,
        [obj.info.hash]: obj,
      };
    }, {});
    const allHashes = [
      ...new Set([
        ...Object.keys(dStorageHashes),
        ...Object.keys(dSettingsHashes),
      ]),
    ];
    return allHashes.map((hash) => {
      return {
        key: hash,
        hash,
        gameAuthAccess: dStorageHashes[hash],
        gameCodesAccess: dSettingsHashes[hash],
        name: dStorageFullGames[hash]?.name || dLobbyGames[hash]?.name,
      };
    });
  }, [storageGames, dStorageFullGames, settingsGames, lobbyGames]);

  const loadGamesFromLocalStorage = () => {
    const games = [];
    for (var key in localStorage) {
      if (key.startsWith(GAME_KEY_PREFIX)) {
        const game = JSON.parse(localStorage.getItem(key));
        games.push(game);
      }
    }
    setStorageGames(games);
    loadGamesByHashesRequest(games.map((game) => game.info.hash)).then(
      (data) => {
        setDStorageFullGames(
          data.items.reduce((acc, obj) => {
            return {
              ...acc,
              [obj.hash]: obj,
            };
          }, {}),
        );
      },
    );
  };

  const getAllCodes = () => {
    const hashesToRemove = [];
    for (const game of dataSource) {
      const hash = game.hash;
      if (!!dStorageFullGames[hash] && !game.gameCodesAccess) {
        dispatch(
          addGame({
            hash,
            nickname: ROLES[ROLE_GAME_VISITOR].name,
            role: ROLE_GAME_VISITOR,
            code: hash,
          }),
        );
      } else if (!game.name) {
        hashesToRemove.push(hash);
      }
    }
    if (hashesToRemove.length && confirm(`Games not found: ${hashesToRemove.join(', ')}. Remove?`)) {
      for (const hash of hashesToRemove) {
        removeGameInfo(hash);
        dispatch(removeGame(hash));
      }
    }
  }

  useEffect(() => {
    loadGamesFromLocalStorage();
  }, []);
  return (
    <>
      <div className="mb-2">
        <Button onClick={getAllCodes}>Load All Codes From Login Settings</Button>
      </div>
      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={{
          pageSize: 5,
        }}
      />
      {/* <pre>
        {JSON.stringify(storageGames, null, 2)}
      </pre> */}
    </>
  );
};

export default AccessGames;
