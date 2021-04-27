export const getParagraphText = (arrText) => {
  return (
    <p className="paragraphText">
      {arrText.map((textItem, i) => {
        // @todo: refactoring
        const arrInserts = textItem.insert ? textItem.insert.split('\n') : [];
        const newInserts = [];
        for (let arrInsert of arrInserts) {
          newInserts.push(arrInsert);
          newInserts.push(<br />);
        }
        newInserts.pop();
        return (
          <span key={i} style={textItem.attributes}>
            {newInserts}
          </span>
        );
      })}
    </p>
  );
};
