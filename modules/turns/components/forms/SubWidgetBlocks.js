import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button } from 'antd';

const SubWidgetBlocks = ({ settings, widget, updateField }) => {
  const { subWidgets } = settings;
  const getSubWidgetActions = (field, defaultParams) => {
    return {
      remove: (index) => {
        const dataCopy = [...widget[field]];
        updateField(field, [
          ...dataCopy.slice(0, index),
          ...dataCopy.slice(index + 1),
        ]);
      },
      addBelow: () => {
        const data = widget[field] || [];
        data.push(defaultParams);
        updateField(field, data);
      },
    };
  };
  return (
    <>
      {subWidgets.map((s, i) => {
        s.actions = getSubWidgetActions(s.field, s.defaultParams);
        return (
          <div key={i}>
            <h4>{s.label}</h4>
            {!!widget &&
              !!widget[s.field] &&
              widget[s.field].map((data, index) => {
                const Component = s.component;
                return (
                  <div className="flex" key={index}>
                    <div className="flex-1">
                      <Component
                        widgetBlock={data}
                        updateWidgetBlock={(newData) => {
                          const items = [...widget[s.field]];
                          items[index] = newData;
                          updateField(s.field, items);
                          // updateField(widget.sources.map((s, i) => i === index ? newSource : s))
                        }}
                      />
                    </div>
                    <div>
                      <Button onClick={() => s.actions.remove(index)}>
                        <DeleteOutlined />
                      </Button>
                    </div>
                  </div>
                );
              })}
            <Button onClick={s.actions.addBelow}>
              <PlusOutlined />
            </Button>
          </div>
        );
      })}
    </>
  );
};

export default SubWidgetBlocks;
