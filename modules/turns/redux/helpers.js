export class TurnHelper {
  static toNewFields(turn) {
    return {
      _id: turn._id,
      contentType: turn.contentType, // turn.pictureOnly

      date: turn.date,
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
      widgets: {
        header: {
          show: !turn.dontShowHeader,
          text: turn.header,
        },
        image: {
          show: !!turn.imageUrl,
          url: turn.imageUrl,
        },
        video: {
          show: !!turn.videoUrl,
          url: turn.videoUrl,
        },
        source: {
          show: !!turn.sourceUrl,
          url: turn.sourceUrl,
        },
        paragraph: {
          show: !!turn.paragraph && turn.paragraph.length && !turn.compressed,
          inserts: turn.paragraph,
          scrollPosition: turn.scrollPosition,
        },
        compressed: {
          show: !!turn.compressed,
          height: turn.compressedHeight,
          uncompressedHeight: turn.uncompressedHeight, // ?
        },
      },
    }
  }
}