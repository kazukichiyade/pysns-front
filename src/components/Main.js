import React, { useContext } from "react";
import { ApiContext } from "../context/ApiContext";
import Grid from "@material-ui/core/Grid";
import { GoMail } from "react-icons/go";
import { BsFillPeopleFill } from "react-icons/bs";
import Profile from "./Profile";
import ProfileManager from "./ProfileManager";
import Ask from "./Ask";
import InboxDM from "./InboxDM";

// Mainに関わる関数(メインコンテンツ) Profile.jsへ渡す物もある
const Main = () => {
  // useContextを使用しApiContext.jsから関数、state取得
  const { profiles, profile, askList, askListFull, inbox } = useContext(
    ApiContext
  );
  // 自分のプロフィール以外をフィルター掛けする為filterメソッドを使用
  const filterProfiles = profiles.filter((prof) => {
    return prof.id !== profile.id;
  });
  // 自分のプロフィール以外かつ、ある場合に自分以外のプロフィールを取得する為、mapメソッドを使用し取得
  const listProfiles =
    filterProfiles &&
    filterProfiles.map((filprof) => (
      <Profile
        key={filprof.id}
        // Profile.jsから取得
        profileData={filprof}
        // Profile.jsから取得(友達申請の全データからフィルター掛けして取得)
        askData={askListFull.filter((ask) => {
          return (
            (filprof.userPro === ask.askFrom) | (filprof.userPro === ask.askTo)
          );
        })}
      />
    ));
  return (
    <Grid container>
      {/* １列目 */}
      <Grid item xs={4}>
        <div className="app-profiles">{listProfiles}</div>
      </Grid>

      {/* ２列目 */}
      <Grid item xs={4}>
        <div className="app-details">
          <ProfileManager />
        </div>
        <h3 className="title-ask">
          <BsFillPeopleFill className="badge" />
          Approval request list
        </h3>
        <div className="app-details">
          <div className="task-list">
            <ul>
              {/* プロフィールがある時かつ自分宛ての友達申請のみ(mapを使用する場合key指定必要) */}
              {profile.id &&
                askList.map((ask) => (
                  <Ask
                    key={ask.id}
                    ask={ask}
                    prof={profiles.filter((item) => {
                      return item.userPro === ask.askFrom;
                    })}
                  />
                ))}
            </ul>
          </div>
        </div>
      </Grid>

      {/* ３列目 */}
      <Grid item xs={4}>
        <h3>
          {/* アイコン */}
          <GoMail className="badge" />
          DM Inbox
        </h3>
        <div className="app-dms">
          <div className="task-list">
            <ul>
              {profile.id &&
                inbox.map((dm) => (
                  <InboxDM
                    key={dm.id}
                    dm={dm}
                    prof={profiles.filter((item) => {
                      return item.userPro === dm.sender;
                    })}
                  />
                ))}
            </ul>
          </div>
        </div>
      </Grid>
    </Grid>
  );
};

export default Main;
