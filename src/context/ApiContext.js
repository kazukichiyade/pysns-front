import React, { createContext, useState, useEffect } from "react";
import { withCookies } from "react-cookie";
import axios from "axios";
// 外部のコンポーネントから利用できるように
export const ApiContext = createContext();

const ApiContextProvider = (props) => {
  // ログイン認証後にcurrent-tokenの中にあるcookieを取得
  const token = props.cookies.get("current-token");
  // ログインしたユーザーのプロフィール
  const [profile, setProfile] = useState([]);
  //   全ユーザーのプロフィール
  const [profiles, setProfiles] = useState([]);
  //   自分のプロフィールの内容
  const [editedProfile, setEditedProfile] = useState({ id: "", nickName: "" });
  //   自分宛に来ている友達の申請リスト
  const [askList, setAskList] = useState([]);
  // 自分宛ての友達申請及び自分が出した友達申請
  const [askListFull, setAskListFull] = useState([]);
  //   DMの受信BOX
  const [inbox, setInbox] = useState([]);
  //   自分のプロフィールの画像
  const [cover, setCover] = useState([]);

  //　ブラウザでコンポーネントが初めて表示される時に必ず一度実行されること(1回目componentDidMountそれ以降componentDidUpdate)
  useEffect(() => {
    //   自分自身のプロフィールを取得する関数
    const getMyProfile = async () => {
      try {
        // 自分自身のプロフィールを取得
        const resmy = await axios.get(
          "http://localhost:8000/api/user/myprofile/",
          {
            headers: {
              Authorization: `Token ${token}`,
            },
          }
        );
        // 友達申請のリストを取得(自分宛ての友達申請及び自分から出した友達申請)
        const res = await axios.get(
          "http://localhost:8000/api/user/approval/",
          {
            headers: {
              Authorization: `Token ${token}`,
            },
          }
        );
        // プロフィールを取得後setProfileへ格納
        resmy.data[0] && setProfile(resmy.data[0]);
        // 起動時に取得したid, nickNameをsetEditedProfileへ格納
        resmy.data[0] &&
          setEditedProfile({
            id: resmy.data[0].id,
            nickName: resmy.data[0].nickName,
          });
        // filterメソッドで自分宛ての友達申請のみsetAskListに格納
        resmy.data[0] &&
          setAskList(
            res.data.filter((ask) => {
              return resmy.data[0].userPro === ask.askTo;
            })
          );
        // 自分宛ての友達申請及び自分から出した友達申請を格納
        setAskListFull(res.data);
      } catch {
        console.log("error");
      }
    };

    // 全ユーザーのプロフィールを取得する関数
    const getProfile = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/user/profile/", {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        // プロフィール情報を格納
        setProfiles(res.data);
      } catch {
        console.log("error");
      }
    };
    // DMの受信箱を取得する関数
    const getInbox = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/dm/inbox/", {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        // DMの内容を格納
        setInbox(res.data);
      } catch {
        console.log("error");
      }
    };
    // 関数呼び出し(3つ)
    getMyProfile();
    getProfile();
    getInbox();
    // useEffect第二引数(追加でuseEffectが走るタイミング)(token変更または、自分のプロフィールに変更があれば再取得)
  }, [token, profile.id]);

  // ログインしたユーザーがプロフィールを新規作成する際に使用する関数
  const createProfile = async () => {
    const createData = new FormData();
    // プロフィールのnickNameをcreateDataへ格納
    createData.append("nickName", editedProfile.nickName);
    // 画像データがあればimg属性にオブジェクトと画像名をcreateDataへ格納(例(img)modelsで設定した属性名を一致させる必要あり)
    cover.name && createData.append("img", cover, cover.name);
    try {
      // createDataの情報をバックエンド側へpost
      const res = await axios.post(
        "http://localhost:8000/api/user/profile/",
        createData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
        }
      );
      // 新規作成できた場合(新しく作成した情報に書き換え)
      setProfile(res.data);
      setEditedProfile({ id: res.data.id, nickName: res.data.nickName });
    } catch {
      console.log("error");
    }
  };

  // 自分のプロフィールを削除する関数
  const deleteProfile = async () => {
    try {
      // idを指定してdelete
      await axios.delete(
        `http://localhost:8000/api/user/profile/${profile.id}/`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
        }
      );
      // filterを使用してプロフィールの一覧から削除した自分のプロフィール以外を格納
      setProfiles(profiles.filter((dev) => dev.id !== profile.id));
      // 自分のプロフィールが無くなっているので初期化
      setProfile([]);
      // 空にしておく
      setEditedProfile({ id: "", nickName: "" });
      // アバター画像も初期化
      setCover([]);
      // 友達のリストも初期化
      setAskList([]);
    } catch {
      console.log("error");
    }
  };

  // プロフィールの編集関数
  const editProfile = async () => {
    const editData = new FormData();
    // nickName属性にnickNameの値をeditDataに格納
    editData.append("nickName", editedProfile.nickName);
    // アバターがあればeditDataに格納
    cover.name && editData.append("img", cover, cover.name);
    try {
      // プロフィールのidを指定しeditDataをput
      const res = await axios.put(
        `http://localhost:8000/api/user/profile/${profile.id}/`,
        editData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
        }
      );
      // 更新後のプロフィールのデータで再格納
      setProfile(res.data);
    } catch {
      console.log("error");
    }
  };
  // 友達申請を新規作成する関数
  const newRequestFriend = async (askData) => {
    try {
      const res = await axios.post(
        `http://localhost:8000/api/user/approval/`,
        askData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
        }
      );
      // 友達申請の全てのリストに今作成した友達申請を追加で格納
      setAskListFull([...askListFull, res.data]);
    } catch {
      console.log("error");
    }
  };
  //   DMを送信した際に発火する関数
  const sendDMCont = async (uploadDM) => {
    try {
      await axios.post(`http://localhost:8000/api/dm/message/`, uploadDM, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      });
    } catch {
      console.log("error");
    }
  };

  // 友達申請を承認する関数(双方)(uploadDataAsk:申請受信側のデータ approvalをfalseからtrue)(ask:申請者側のデータ)
  const changeApprovalRequest = async (uploadDataAsk, ask) => {
    try {
      // 申請者側のIDを指定しput
      const res = await axios.put(
        `http://localhost:8000/api/user/approval/${ask.id}/`,
        uploadDataAsk,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
        }
      );
      // 友達申請のリストから、今申請した値を書き換えて格納
      setAskList(askList.map((item) => (item.id === ask.id ? res.data : item)));

      // オブジェクトが同時に存在する場合と存在しない場合がある為FormDataを二つ作成(オブジェクトが存在しない場合)
      const newDataAsk = new FormData();
      newDataAsk.append("askTo", ask.askFrom);
      newDataAsk.append("approved", true);

      // オブジェクトが同時に存在する場合と存在しない場合がある為FormDataを二つ作成(オブジェクトが同時に存在する場合)
      const newDataAskPut = new FormData();
      newDataAskPut.append("askTo", ask.askFrom);
      newDataAskPut.append("askFrom", ask.askTo);
      newDataAskPut.append("approved", true);

      // 友達申請時に既にオブジェクトが存在するかをfilterメソッドで確認する関数
      const resp = askListFull.filter((item) => {
        return item.askFrom === profile.userPro && item.askTo === ask.askFrom;
      });

      // 上記の関数の返り値が存在しない場合post(新規申請作成)
      !resp[0]
        ? await axios.post(
            `http://localhost:8000/api/user/approval/`,
            newDataAsk,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${token}`,
              },
            }
          )
        : //　上記の関数の返り値が存在する場合put(申請更新)
          await axios.put(
            `http://localhost:8000/api/user/approval/${resp[0].id}/`,
            newDataAskPut,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${token}`,
              },
            }
          );
    } catch {
      console.log("error");
    }
  };

  return (
    // 他のcomponentで共有したい、関数やstateを列挙する
    <ApiContext.Provider
      value={{
        profile,
        profiles,
        cover,
        setCover,
        askList,
        askListFull,
        inbox,
        newRequestFriend,
        createProfile,
        editProfile,
        deleteProfile,
        changeApprovalRequest,
        sendDMCont,
        editedProfile,
        setEditedProfile,
      }}
    >
      {/* App.js等のdivタグに対応する為 */}
      {props.children}
    </ApiContext.Provider>
  );
};

export default withCookies(ApiContextProvider);
