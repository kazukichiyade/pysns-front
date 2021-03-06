import React, { useState, useContext } from "react";
import { ApiContext } from "../context/ApiContext";
import Button from "@material-ui/core/Button";
import Modal from "react-modal";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import { makeStyles } from "@material-ui/core/styles";
import { RiMailAddLine } from "react-icons/ri";
import { IoIosSend } from "react-icons/io";
import { IoMdClose } from "react-icons/io";

const useStyles = makeStyles((theme) => ({
  button: {
    margin: theme.spacing(1),
  },
  text: {
    margin: theme.spacing(3),
  },
}));

// ask:自分宛ての友達申請リスト prof:送ってきた人のプロフィール情報
const Ask = ({ ask, prof }) => {
  const classes = useStyles();
  Modal.setAppElement("#root");
  const { changeApprovalRequest, sendDMCont } = useContext(ApiContext);
  // Modalの開閉の状態
  const [modalIsOpen, setModalIsOpen] = useState(false);
  // DMのtextの内容の状態
  const [text, setText] = useState("");

  // モーダルの表示位置
  const customStyles = {
    content: {
      top: "50%",
      left: "42%",
      right: "auto",
      bottom: "auto",
    },
  };

  // モーダルでのvalueの変更の状態を持つ関数
  const handleInputChange = () => (event) => {
    const value = event.target.value;
    setText(value);
  };

  // DMを送信する関数
  const sendDM = () => {
    const uploadDM = new FormData();
    // 送り先及びメッセージ内容をappendで格納
    uploadDM.append("receiver", ask.askFrom);
    uploadDM.append("message", text);
    // ApiContextにて関数を定義してある
    sendDMCont(uploadDM);
    // モーダルを閉じる
    setModalIsOpen(false);
  };

  // 承認ボタンを押した時に発火する関数
  const changeApproval = () => {
    const uploadDataAsk = new FormData();
    // 自分宛て及びapproved:trueをappendで格納
    uploadDataAsk.append("askTo", ask.askTo);
    uploadDataAsk.append("approved", true);
    // ApiContextにて関数を定義してある
    changeApprovalRequest(uploadDataAsk, ask);
  };

  return (
    <li className="list-item">
      <h4> {prof[0].nickName}</h4>
      {/* approvedがfalseの場合に申請ボタンを表示 　approvedがtrueの場合DM可能のアイコンを表示*/}
      {!ask.approved ? (
        <Button
          size="small"
          className={classes.button}
          variant="contained"
          color="primary"
          onClick={() => changeApproval()}
        >
          Approve
        </Button>
      ) : (
        <button className="mail" onClick={() => setModalIsOpen(true)}>
          <RiMailAddLine />
        </button>
      )}

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        style={customStyles}
      >
        <Typography>Message</Typography>
        <TextField
          className={classes.text}
          type="text"
          onChange={handleInputChange()}
        />
        <br />
        <button className="btn-modal" onClick={() => sendDM()}>
          <IoIosSend />
        </button>
        <button className="btn-modal" onClick={() => setModalIsOpen(false)}>
          <IoMdClose />
        </button>
      </Modal>
    </li>
  );
};

export default Ask;
