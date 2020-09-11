import React, { useReducer } from "react";
import { withCookies } from "react-cookie";
import axios from "axios";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import CircularProgress from "@material-ui/core/CircularProgress";
import {
  START_FETCH,
  FETCH_SUCCESS,
  ERROR_CATCHED,
  INPUT_EDIT,
  TOGGLE_MODE,
} from "./actionTypes";

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: "100%",
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  span: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    color: "teal",
  },
  spanError: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    color: "fuchsia",
    marginTop: 10,
  },
}));

// 初期状態
const initialState = {
  // ログインのLoadingがされてるか(Loadingの最中のみtrueになる)
  isLoading: false,
  // ログインのviewか新規作成のviewかの状態
  isLoginView: true,
  // エラ〜メッセージの格納
  error: "",
  // ログインの場合
  credentialsLog: {
    username: "",
    password: "",
  },
  //　新規作成の場合
  credentialsReg: {
    email: "",
    password: "",
  },
};

// 状態によっての様々な変更に対応する関数
const loginReducer = (state, action) => {
  switch (action.type) {
    // APIアクセス開始時
    case START_FETCH: {
      return {
        //   部分的に更新したい場合使用(state全展開)
        ...state,
        isLoading: true,
      };
    }
    // 成功時
    case FETCH_SUCCESS: {
      return {
        ...state,
        isLoading: false,
      };
    }
    // エラー時
    case ERROR_CATCHED: {
      return {
        ...state,
        error: "Email or password is not correct!",
        isLoading: false,
      };
    }
    // 入力フォーム編集時
    case INPUT_EDIT: {
      return {
        ...state,
        [action.inputName]: action.payload,
        error: "",
      };
    }
    // ログインと新規アカウントの切り替え
    case TOGGLE_MODE: {
      return {
        ...state,
        isLoginView: !state.isLoginView,
      };
    }
    default:
      return state;
  }
};

const Login = (props) => {
  const classes = useStyles();
  const [state, dispatch] = useReducer(loginReducer, initialState);

  // 入力フォームに変更があった際毎回呼び出される関数(ログイン)
  const inputChangedLog = () => (event) => {
    const cred = state.credentialsLog;
    // 入力フォームのオブジェクトをmail_addressまたはpasswordに格納する
    cred[event.target.name] = event.target.value;
    dispatch({
      type: INPUT_EDIT,
      inputName: "state.credentialLog",
      payload: cred,
    });
  };

  // 入力フォームに変更があった際毎回呼び出される関数(新規登録)
  const inputChangedReg = () => (event) => {
    const cred = state.credentialsReg;
    // 入力フォームのオブジェクトをusernameまたはpasswordに格納する
    cred[event.target.name] = event.target.value;
    dispatch({
      type: INPUT_EDIT,
      inputName: "state.credentialReg",
      payload: cred,
    });
  };

  // submit時のログイン関数(async,awaitを使用しaxiosを使用した際にレスポンスが来るまで待機)
  const login = async (event) => {
    // ページリフレッシュ阻止
    event.preventDefault();
    // ログインの場合
    if (state.isLoginView) {
      try {
        dispatch({ type: START_FETCH });
        const res = await axios.post(
          "http://127.0.0.1:8000/authen/",
          state.credentialsLog,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        props.cookies.set("current-token", res.data.token);
        res.data.token
          ? (window.location.href = "/profiles")
          : (window.location.href = "/");
        dispatch({ type: FETCH_SUCCESS });
      } catch {
        dispatch({ type: ERROR_CATCHED });
      }
      // 新規登録の場合
    } else {
      try {
        dispatch({ type: START_FETCH });
        await axios.post(
          "http://127.0.0.1:8000/api/user/create/",
          state.credentialsReg,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        dispatch({ type: FETCH_SUCCESS });
        dispatch({ type: TOGGLE_MODE });
      } catch {
        dispatch({ type: ERROR_CATCHED });
      }
    }
  };

  // ログインと新規登録を切り替える関数
  const toggleView = () => {
    dispatch({ type: TOGGLE_MODE });
  };

  return (
    <Container maxWidth="xs">
      <form onSubmit={login}>
        <div className={classes.paper}>
          {state.isLoading && <CircularProgress />}
          <Avatar className={classes.avatar}>
            {/* 鍵アイコン */}
            <LockOutlinedIcon />
          </Avatar>
          <Typography variant="h5">
            {/* LoginかRegisterかで表示文字をコントール */}
            {state.isLoginView ? "Login" : "Register"}
          </Typography>

          {/* ログイン(email)の場合もしくは新規登録(username)の場合に表示するForm */}
          {state.isLoginView ? (
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              label="Email"
              name="username"
              value={state.credentialsLog.username}
              onChange={inputChangedLog()}
              autoFocus
            />
          ) : (
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              label="Email"
              name="email"
              value={state.credentialsReg.email}
              onChange={inputChangedReg()}
              autoFocus
            />
          )}

          {/* ログイン(password)の場合もしくは新規登録(password)の場合に表示するForm */}
          {state.isLoginView ? (
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={state.credentialsLog.password}
              onChange={inputChangedLog()}
            />
          ) : (
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={state.credentialsReg.password}
              onChange={inputChangedReg()}
            />
          )}
          {/* エラーメッセージの表示() */}
          <span className={classes.spanError}>{state.error}</span>

          {state.isLoginView ? (
            !state.credentialsLog.password || !state.credentialsLog.username ? (
              <Button
                className={classes.submit}
                type="submit"
                fullWidth
                disabled
                variant="contained"
                color="primary"
              >
                Login
              </Button>
            ) : (
              <Button
                className={classes.submit}
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
              >
                Login
              </Button>
            )
          ) : !state.credentialsReg.password || !state.credentialsReg.email ? (
            <Button
              className={classes.submit}
              type="submit"
              fullWidth
              disabled
              variant="contained"
              color="primary"
            >
              Register
            </Button>
          ) : (
            <Button
              className={classes.submit}
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
            >
              Register
            </Button>
          )}

          {/* ログイン、新規登録の切り替えボタン */}
          <span onClick={() => toggleView()} className={classes.span}>
            {state.isLoginView ? "Create Accout ?" : "Back to login ?"}
          </span>
        </div>
      </form>
    </Container>
  );
};

export default withCookies(Login);
