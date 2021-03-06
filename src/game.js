import {
  getTurns,
  createTurn,
  updateTurn,
  deleteTurn,
  updateViewport,
  turnsUpdateCoordinates,
  getRedLogicLines,
  updateRedLogicLines,
  createRedLogicLine,
  deleteLines,
  // getUser,
} from './service';
import {
  TurnCollection,
  LinesCollection,
  QuotesCollection,
} from './collections';
import GameField from './gameField';
import ToolsPanel from './toolsPanel';
import { getPopup } from './popup';
import ClassPanel from './classPanel';
import LinesLayer from './linesLayer';
import QuotesPanel from './quotesPanel';
import { NotificationPanel, GameClassPanel } from './script';
import { MiniMap } from './minimap';

// настраивает компоненты игры,
// обеспечивает передачу данных между компонентами
class Game {
  constructor({ stageEl, settings, user, timecode, dispatchers }) {
    this.stageEl = stageEl;
    this.triggers = {};
    this.user = user;
    this.userInfo = this.user.info; // info (hash, nickname, role)
    this.userToken = this.user.token;
    this.timecode = timecode;
    this.dispatchers = dispatchers;

    const { notificationAlert } = settings;
    this.notificationAlert = notificationAlert;

    this.gameField = new GameField(
      {
        stageEl: this.stageEl,
      },
      this.triggers
    );

    this.toolsPanel = new ToolsPanel({}, this.triggers, this.user);
    this.classPanel = new ClassPanel({}, this.triggers);

    this.popup = getPopup(document.body, this.triggers);
    this.linesLayer = new LinesLayer(
      {
        stageEl,
        quotesPanel: new QuotesPanel({}, this.triggers, this.user), // создали панель управления линиями
      },
      this.triggers
    );

    this.notificationPanel = new NotificationPanel('notificationPanel');
    this.gameClassPanel = new GameClassPanel('classMenu');
    // this.minimap = new MiniMap('minimap');

    window[Symbol.for('MyGame')] = this; // для minimap (screenshooter.js)
  }
  setGameData(gameData) {
    // console.log({ gameData });
    const { viewportPointX, viewportPointY } = gameData; // координаты viewport для этого hash игрока
    this.viewportPoint = {
      x: viewportPointX,
      y: viewportPointY,
    };
  }
  async init() {
    const result = await getTurns();
    this.turnCollection = new TurnCollection(
      {
        turnsData: result.items,
        stageEl: this.stageEl,
        timecode: this.timecode,
      },
      this.triggers,
      this.user
    );

    this.dispatchers.minimapDispatch({
      type: 'MAP_INIT',
      payload: {
        ...this.turnCollection.getScreenRect(),
      },
    });

    const {
      item: { redLogicLines },
    } = await getRedLogicLines();
    this.linesLayer.quotesCollection = new QuotesCollection(
      this.turnCollection.getTurns(),
      this.triggers
    );
    this.linesLayer.linesCollection = new LinesCollection(redLogicLines, {
      getQuote: this.linesLayer.quotesCollection.getQuote,
    });
    this.linesLayer.render();

    this.triggers.dispatch = async (type, data) => {
      // добавить логгер действий пользователя - потом её можно использовать в тестах и телеметрии
      switch (type) {
        case 'SAVE_FIELD_POSITION': {
          const zeroPoint = this.turnCollection.getZeroPointTurn();
          const { x: dataX, y: dataY } = zeroPoint.getPositionInfo();

          this.viewportPoint = {
            x: -dataX,
            y: -dataY,
          };

          console.log({ zeroPoint });
          console.log({ viewportPoint: this.viewportPoint });

          await updateViewport(this.viewportPoint);

          const turns = await this.turnCollection
            .getTurns()
            .filter((turn) => turn.wasChanged === true); // ход был изменён, сохранить только его

          const reggaeTurn = await this.turnCollection
            .getTurns()
            .find((turn) => turn.data.header === 'Reggae');

          console.log({ reggaeTurn });

          for (let turn of turns) {
            turn.wasChanged = false;
            console.log('turn.x turn.y', turn.x, turn.y);
          }
          // console.log({ turns });
          const payload = this.gameField
            .saveTurnPositions(turns)
            .map((turn) => {
              return { ...turn, x: turn.x - dataX, y: turn.y - dataY };
            });
          console.log({ payload });
          await turnsUpdateCoordinates(payload);

          // this.notificationAlert({
          //   msgTitle: 'Info:',
          //   msgText: 'Field has been saved',
          //   timespan: 1500,
          // });
          this.notificationPanel.alert({
            msgTitle: 'Info:',
            msgText: 'Field has been saved',
            timespan: 1500,
          });
          console.log('Positions of all turns re-saved.');
          break;
        }
        case 'RECALCULATE_FIELD': {
          // двигает все ходы при отпускании draggable() поля
          const turns = await this.turnCollection.getTurns();
          this.gameField.recalculate(turns);
          this.dispatchers.minimapDispatch({
            type: 'VIEWPORT_MOVED_ON_FIELD',
            payload: {
              ...this.turnCollection.getScreenRect(),
            },
          });
          break;
        }
        case 'DRAW_LINES': {
          this.linesLayer.render();
          break;
        }
        case 'CREATE_LINE': {
          createRedLogicLine({
            sourceTurnId: data.sourceQuote.turnId,
            sourceMarker: data.sourceQuote.index,
            targetTurnId: data.targetQuote.turnId,
            targetMarker: data.targetQuote.index,
          }).then((res) => {
            const { item } = res;
            // добавить в коллекцию линий
            this.linesLayer.linesCollection.addLine(item);
            // отрисовать линии
            this.linesLayer.render();
          });
          break;
        }
        case 'DELETE_LINE': {
          // удалить отрисовку линии
          const { line } = data;
          this.linesLayer.linesCollection.removeLine(line);
          this.linesLayer.render();
          // проверить нужны ли рамки у цитат
          this.linesLayer.checkIfRedBorderNeeded(line.sourceQuote);
          this.linesLayer.checkIfRedBorderNeeded(line.targetQuote);
          // удалить линию из нижней панели
          // при необходимости - закрыть
          this.linesLayer.removeActiveQuote();
          // отправить запрос на бэкенд
          updateRedLogicLines(
            this.linesLayer.linesCollection.getLines().map((line) => line.data)
          );
          break;
        }
        case 'CREATE_TURN': {
          createTurn(data).then((res) => {
            // console.log(res);
            this.turnCollection.addTurn(res.item);
          });
          break;
        }
        case 'SAVE_TURN': {
          this.turnCollection.updateTurn(data);
          this.turnCollection.getTurn(data).update();
          updateTurn(data);
          break;
        }
        case 'REMOVE_TURN': {
          this.turnCollection.getTurn(data).destroy();
          this.turnCollection.removeTurn(data);
          const linesToRemove = this.linesLayer.linesCollection
            .getLines()
            .filter((line) => {
              if (line.sourceQuote.data.turnId === data._id) {
                return true;
              }
              if (line.targetQuote.data.turnId === data._id) {
                return true;
              }
              return false;
            });
          for (let lineToRemove of linesToRemove) {
            this.linesLayer.linesCollection.removeLine(lineToRemove);
          }
          this.linesLayer.render();
          console.log(linesToRemove);
          deleteLines(linesToRemove.map((line) => line.data)).then(() =>
            deleteTurn(data)
          );
          break;
        }
        case 'OPEN_POPUP': {
          if (data) {
            // обновление
            this.popup.openModal();
            this.popup.setTurn(data); // подставляет данные в модальное окно
          } else {
            // открытие попапа
            this.popup.openModal();
          }
          break;
        }
        // case 'TOGGLE_CLASS_PANEL': {
        //     this.classPanel.togglePanelVisibility();
        //     break;
        // }
        case 'MAKE_FIELD_TRANSLUCENT': {
          this.gameField.makeTranslucent(data); // data = true/false
          break;
        }
        case 'TOGGLE_LINES_FRONT_BACK': {
          this.linesLayer.toggleLinesZIndex();
          break;
        }
        case 'CLICKED_QUOTE': {
          this.linesLayer.setClickedQuote(data);
          break;
        }
        case 'TOGGLE_MINIMAP': {
          // показывает minimap игрового поля на экране
          // this.minimap.renderMiniMap();
          console.log('clicked on minimap btn');
          break;
        }
        // lines and markers
        // ACTIVATE_MARKER (DEACTIVATE_MARKER) - click on yellow
        // CONNECT_MARKERS - click on yellow
        // SHOW_MARKERS_PANEL / HIDE_MARKERS_PANEL - click on marker
        // RENDER_LINES
        // TOGGLE_LINES_VISIBILITY - button
        // TOGGLE_LINES_TO_BACK - button

        case 'ZOOM_IN': {
          break;
        } // д.з. какие здесь ещё понадобятся функции?
        case 'EDIT_CLASS': {
          break;
        }
        case 'EDIT_SUBCLASS': {
          break;
        }
        case 'DELETE_SUBCLASS': {
          break;
        }
        case 'FLY_TO_MINIMAP': {
          break;
        }
      }
    };

    // const zeroPoint = this.turnCollection.getZeroPointTurn();
    // console.log({ zeroPoint });
    const { x, y } = this.viewportPoint;
    const gf = window[Symbol.for('MyGame')].gameField;
    $(gf.stageEl).animate(
      {
        // left: `${-zeroPoint.data.x}px`,
        // top: `${-zeroPoint.data.y}px`,
        left: `${-x}px`,
        top: `${-y}px`,
      },
      300,
      () => {
        gf.triggers.dispatch('RECALCULATE_FIELD');
        gf.triggers.dispatch('DRAW_LINES');
      }
    );
    this.gameField.handleLoadImages();
    this.notificationPanel.alert({
      msgTitle: 'Info:',
      msgText: `User ${this.userInfo.nickname} logged in`,
      timespan: 1500,
    });
  }
  addEventListeners() {}
}

export default Game;
