import {
  WIDGET_AUDIO,
  WIDGET_AUDIO_QUOTES,
  WIDGET_HEADER,
  WIDGET_PARAGRAPH,
  WIDGET_PDF,
  WIDGET_PICTURE,
  WIDGET_SOURCE,
  WIDGET_VIDEO,
  WIDGET_VIDEO_QUOTES,
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
        {
          id: 'v_1',
          show: !!turn.videoUrl,
          url: turn.videoUrl,
          preview: turn.videoPreview,
        },
      ],
      [WIDGET_AUDIO]: [
        { id: 'a_1', show: !!turn.audioUrl, url: turn.audioUrl },
      ],
      [WIDGET_PDF]: [
        {
          id: 'pdf_1',
          show: !!turn.pdfUrl,
          url: turn.pdfUrl,
          // одно поле scrollPosition на ход: у pdf-хода нет скроллящегося
          // параграфа, поэтому конфликта с p_1 не возникает
          scrollPosition: turn.scrollPosition || 0,
          quotes: turn.quotes.filter((quote) => quote.type === 'pdf'),
        },
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
          show: !!turn.paragraph && !!turn.paragraph.length, // && !turn.compressed,
          inserts: turn.paragraph,
          scrollPosition: turn.scrollPosition || 0,
          quotes: turn.quotes.filter((quote) => quote.type === 'text'),
          compressed: !!turn.compressed,
        },
      ],
      [WIDGET_VIDEO_QUOTES]: [
        {
          id: 'vq_1',
          show: !!turn.videoQuotes,
          duration: turn.videoQuotes?.duration || 0,
          // quotes: turn.quotes.filter((quote) => quote.type === 'video'),
          quotes: turn.videoQuotes?.quotes || [],
        },
      ],
      [WIDGET_AUDIO_QUOTES]: [
        {
          id: 'aq_1',
          show: !!turn.audioQuotes,
          duration: turn.audioQuotes?.duration || 0,
          // quotes: turn.quotes.filter((quote) => quote.type === 'video'),
          quotes: turn.audioQuotes?.quotes || [],
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
      pictureOnly: turn.pictureOnly || false, // @todo: remove
      gameId: turn.gameId,
      originalId: turn.originalId,
      date: turn.date,
      sourceUrl: turn.sourceUrl,
      updatedAt: turn.updatedAt,

      // COMPRESSED PARAGRAPH
      compressed: turn.compressed,
      paragraph: turn.paragraph,
      uncompressedHeight: turn.uncompressedHeight || turn.height,

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
      quotes: [
        ...turn.dWidgets.p_1.quotes,
        ...turn.dWidgets.i_1.quotes,
        ...turn.dWidgets.vq_1.quotes,
        ...turn.dWidgets.aq_1.quotes,
        ...(turn.dWidgets.pdf_1?.quotes || []),
      ],
      contentType: turn.contentType, // turn.pictureOnly
      pictureOnly: turn.pictureOnly || false, // @todo: remove
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
      videoQuotes: turn.dWidgets.vq_1
        ? {
            duration: turn.dWidgets.vq_1.duration,
            connectedTo: turn.dWidgets.vq_1.connectedTo,
          }
        : null,
      audioQuotes: turn.dWidgets.aq_1
        ? {
            duration: turn.dWidgets.aq_1.duration,
            connectedTo: turn.dWidgets.aq_1.connectedTo,
          }
        : null,
      audioUrl: turn.dWidgets.a_1.url,
      pdfUrl: turn.dWidgets.pdf_1?.url,
      sourceUrl: turn.sourceUrl,
      date: turn.date,
      paragraph: turn.dWidgets.p_1.inserts,
      scrollPosition: turn.dWidgets.p_1.scrollPosition || 0,
      compressed: turn.p_1?.compressed || false,
      updatedAt: turn.updatedAt,
      uncompressedHeight: turn.uncompressedHeight || turn.height,
    };
  }
}
