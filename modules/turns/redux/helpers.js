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
        {
          id: 'i_1',
          show: !!turn.imageUrl,
          url: turn.imageUrl,
          quotes: turn.quotes.filter((quote) => quote.type === 'picture'),
        },
      ],
      [WIDGET_VIDEO]: [
        { id: 'v_1', show: !!turn.videoUrl, url: turn.videoUrl },
      ],
      [WIDGET_SOURCE]: [
        {
          id: 's_1',
          show: (!!turn.sourceUrl || !!turn.date) && turn.dontShowHeader,
          date: turn.date,
          url: turn.sourceUrl,
        },
      ],
      [WIDGET_PARAGRAPH]: [
        {
          id: 'p_1',
          show: !!turn.paragraph && turn.paragraph.length && !turn.compressed,
          inserts: turn.paragraph,
          scrollPosition: turn.scrollPosition,
          quotes: turn.quotes.filter((quote) => quote.type === 'text'),
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
        dWidgets[widget.id] = { ...widget, type };
      }
    }

    const widgetToShow = Object.values(dWidgets)
      .filter((widget) => widget.show)
      .map((widget) => ({
        type: widget.type,
        id: widget.id,
      }));

    return {
      _id: turn._id,
      contentType: turn.contentType, // turn.pictureOnly
      pictureOnly: false, // @todo: remove
      gameId: turn.gameId,
      originalId: turn.originalId,
      date: turn.date,
      sourceUrl: turn.sourceUrl,

      // COMPRESSED PARAGRAPH
      compressed: turn.compressed,
      paragraph: turn.paragraph,
      compressedHeight: turn.compressedHeight,

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
      widgets,
      dWidgets,
      widgetToShow,
    };
  }

  static toOldFields(turn) {
    return {
      _id: turn._id,
      backgroundColor: turn.colors.background,
      fontColor: turn.colors.font,
      quotes: [...turn.dWidgets.p_1.quotes, ...turn.dWidgets.i_1.quotes],
      contentType: turn.contentType, // turn.pictureOnly
      gameId: turn.gameId,
      originalId: turn.originalId,
      x: turn.position.x,
      y: turn.position.y,
      width: turn.size.width,
      height: turn.size.height,
      dontShowHeader: !turn.dWidgets.h_1.show,
      header: turn.dWidgets.h_1.text,
      imageUrl: turn.dWidgets.i_1.url,
      videoUrl: turn.dWidgets.v_1.url,
      sourceUrl: turn.sourceUrl,
      date: turn.date,
      paragraph: turn.dWidgets.p_1.inserts,
      scrollPosition: turn.dWidgets.p_1.scrollPosition,
      compressed: turn.dWidgets.c_1.show,
      compressedHeight: turn.dWidgets.c_1.compressedHeight,
      uncompressedHeight: turn.dWidgets.c_1.uncompressedHeight,
    };
  }
}
