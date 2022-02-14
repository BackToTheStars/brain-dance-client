import { useEffect } from "react";

const Paragraph = ({registerHandleResize}) => {
  useEffect(() => {
    registerHandleResize({
      type: 'paragraph',
      id: 'paragraph',
      minWidthCallback: () => 300,
      minHeightCallback: () => 100,
      maxHeightCallback: () => 500,
    });
  }, []);

  return (
    <div>
      Paragraph
    </div>
  )
}

export default Paragraph