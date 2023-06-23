import {
  WIDGET_COMPRESSED,
  WIDGET_HEADER,
  WIDGET_PARAGRAPH,
  WIDGET_PICTURE,
  WIDGET_SOURCE,
  WIDGET_VIDEO,
} from '../settings';

export class TurnHelper {
  static toNewFields(turn) {
    const widgets = {
      [WIDGET_HEADER]: [
        {
          id: 'h_1',
          show: !turn.dontShowHeader,
          text: turn.header,
        },
      ],
      [WIDGET_PICTURE]: [
        { id: 'i_1', show: !!turn.imageUrl, url: turn.imageUrl },
      ],
      [WIDGET_VIDEO]: [
        { id: 'v_1', show: !!turn.videoUrl, url: turn.videoUrl },
      ],
      [WIDGET_SOURCE]: [
        {
          id: 's_1',
          date: turn.date,
          show: !!turn.sourceUrl,
          url: turn.sourceUrl,
        },
      ],
      [WIDGET_PARAGRAPH]: [
        {
          id: 'p_1',
          show: !!turn.paragraph && turn.paragraph.length && !turn.compressed,
          inserts: turn.paragraph,
          scrollPosition: turn.scrollPosition,
        },
      ],
      [WIDGET_COMPRESSED]: [
        {
          id: 'c_1',
          show: !!turn.compressed,
          height: turn.compressedHeight,
          uncompressedHeight: turn.uncompressedHeight, // ?
        },
      ],
    };
    // {
    //   h_1: {
    //     id: 'h_1',
    //     show: !turn.dontShowHeader,
    //     text: turn.header,
    //     type: 'header'
    //   }
    // }

    const dWidgets = {};

    for (const type in widgets) {
      for (const widget of widgets[type]) {
        // сейчас там только нулевой элемент
        dWidgets[widget.id] = widget;
      }
    }

    return {
      _id: turn._id,
      contentType: turn.contentType, // turn.pictureOnly
      pictureOnly: false, // @todo: remove
      gameId: turn.gameId,
      originalId: turn.originalId,

      colors: {
        background: turn.backgroundColor,
        font: turn.fontColor,
      },
      position: {
        x: turn.x,
        y: turn.y,
      },
      size: {
        width: turn.width,
        height: turn.height,
      },

      quotes: turn.quotes,
      widgetsCount: 0,
      // displayedWidgets: ['header1', 'video1', 'picture1', 'paragraph1'],
      widgets,
      dWidgets,
    };
  }

  static toOldFields(turn) {
    return {
      x: turn.position.x,
      y: turn.position.y,
      width: turn.size.width,
      height: turn.size.height,
    };
  }
}
