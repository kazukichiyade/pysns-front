import React, { useContext } from "react";
import { ApiContext } from "../context/ApiContext";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles((theme) => ({
  button: {
    margin: theme.spacing(1),
  },
}));

// プロフィールに関わる関数 Main.jsから二つの引数取得(profileData:全プロフィールの内容, askData:ログインしているユーザーに対しての友達申請がどうなっているか)
const Profile = ({ profileData, askData }) => {
  const classes = useStyles();
  // ApiContext.jsで作成した関数、stateを取得できる
  const { newRequestFriend, profile } = useContext(ApiContext);

  // 友達申請の新規作成(プロフィールから選択したユーザーに対して送信)
  const newRequest = () => {
    const askUploadData = new FormData();
    askUploadData.append("askTo", profileData.userPro);
    // ApiContext.jsのnewRequestFriend関数へ
    newRequestFriend(askUploadData);
  };

  return (
    <Card style={{ position: "relative", display: "flex", marginBottom: 10 }}>
      {/* CardMedia アバターのimg画像があるもしくは無しの分岐 */}
      {profileData.img ? (
        <CardMedia style={{ minWidth: 100 }} image={profileData.img} />
      ) : (
        <CardMedia
          style={{ minWidth: 100 }}
          image="http://127.0.0.1:8000/media/image/null.png"
        />
      )}

      <CardContent style={{ padding: 5 }}>
        {/* 各プロフィールのprofileDataからnickNameを取り出す */}
        <Typography variant="h6">{profileData.nickName}</Typography>
        {/* 各プロフィールのprofileDataからcreated_onを取り出す */}
        <Typography>{profileData.created_on}</Typography>
        {/* 友達申請のボタン(askDataが無い場合かつprofileのidがある) */}
        {!askData[0] && profile.id ? (
          <Button
            size="small"
            className={classes.button}
            variant="contained"
            color="primary"
            onClick={() => newRequest()}
          >
            Ask as friend
          </Button>
        ) : (
          <Button
            size="small"
            className={classes.button}
            variant="contained"
            color="primary"
            disabled
          >
            Ask as friend
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default Profile;
