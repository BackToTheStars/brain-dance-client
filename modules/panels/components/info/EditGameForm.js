import { updateGame } from '@/modules/game/game-redux/actions';
import { addNotification } from '@/modules/ui/redux/actions';
import { Button, Form, Input, Radio } from 'antd';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// должна быть доступна только для ROLE_GAME_OWNER (RULE_GAME_EDIT)
const EditGameForm = () => {
  const dispatch = useDispatch();
  //
  const editGame = (data) => {
    dispatch(updateGame(data))
      .then(() => {
        dispatch(addNotification({ title: 'Info:', text: 'Game updated.' }));
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const game = useSelector((state) => state.game.game);

  const [name, setName] = useState(game.name);
  const [image, setImage] = useState(game.image);
  const [gameIsPublic, setGameIsPublic] = useState(
    game.public ? 'true' : 'false',
  );
  const [description, setDescription] = useState(game.description);

  console.log({
    name,
    gameIsPublic,
    hash: game.hash,
    description,
    image,
  });

  const showConfirmDialog = ({ text, okCallback }) => {
    if (confirm(text)) {
      okCallback();
    }
  };

  const handleSubmit = (e) => {
    // e.preventDefault();
    const data = {
      name,
      public: gameIsPublic === 'true',
      hash: game.hash,
      description,
      image,
    };
    if (!gameIsPublic) {
      showConfirmDialog({
        text: 'You will NEVER see this game again, if you will not save its access code right now!!!',
        okCallback: () => {
          editGame(data);
        },
      });
    } else {
      editGame(data);
    }
  };

  // useEffect(() => {
  //   setName(game.name);
  //   setImage(game.image);
  //   setGameIsPublic(game.public);
  //   setDescription(game.description);
  // }, [game]);

  return (
    <div className="p-3">
      <Form
        className="ant-card"
        onFinish={(e) => handleSubmit(e)}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
      >
        <Form.Item
          name="gameIsPublic"
          valuePropName="checked"
          initialValue={gameIsPublic}
        >
          <Radio.Group
            className="radio-group_white-text"
            value={gameIsPublic}
            onChange={(e) => setGameIsPublic(e.target.value)}
          >
            <Radio value="true">Public</Radio>
            <Radio value="false">Private</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          initialValue={name}
          name="name"
          value={name}
          label={<span className="text-white">Name</span>}
          rules={[{ required: true, message: 'Please input name!' }]}
        >
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </Form.Item>
        <Form.Item
          initialValue={image}
          name="image"
          label={<span className="text-white">Screenshot</span>}
          rules={[{ required: true, message: 'Please input image!' }]}
        >
          <Input value={image} onChange={(e) => setImage(e.target.value)} />
        </Form.Item>
        <Form.Item
          initialValue={description}
          name="description"
          label={<span className="text-white">Description</span>}
        >
          <Input.TextArea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Form.Item>
        <Form.Item>
          <Button size="small" type="primary" htmlType="submit">
            Save
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default EditGameForm;
