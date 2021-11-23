import React, { useEffect, useState } from 'react';
import Header from '@src/components/Header/Header';
import styled from 'styled-components';
import { flexBox } from '@src/lib/styles/mixin';
import { Palette } from '@src/lib/styles/Palette';
import useHabitatInfo from '@src/hooks/useHabitatInfo';
import { useParams } from 'react-router';
import { User } from '@src/types/User';
import UserAbout from '@src/components/User/UserAbout';
import UserFeed from '@src/components/User/UserFeed';
import MagicNumber from '@src/lib/styles/magic';

const DEFAULT_HABITAT_ID = 2;

const UserPage = () => {
  const param: { id: string } = useParams();
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const { habitatInfo } = useHabitatInfo(userInfo?.habitatId ?? DEFAULT_HABITAT_ID);

  useEffect(() => {
    console.log(param);
    const fetchUserInfo = async () => {
      const res: Response = await fetch(`/api/users/${param.id}`);
      if (res.ok) {
        const data: User = await res.json();
        console.log(data);
        setUserInfo(data);
      } else {
        console.log(res);
      }
    };

    try {
      fetchUserInfo();
    } catch (e) {
      console.log(e);
    }
  }, [param]);
  return (
    <UserPageDiv>
      <Header habitatInfo={habitatInfo} />
      <ContentDiv color={habitatInfo?.habitat.color}>
        <UserAbout userInfo={userInfo} />
        <UserFeed userId={userInfo?.id} />
      </ContentDiv>
    </UserPageDiv>
  );
};

export default UserPage;

const UserPageDiv = styled.div`
  ${flexBox(null, null, 'column')};
  overflow: hidden;
  position: relative;
  width: 100vw;
  height: 100vh;
  background-color: ${Palette.BACKGROUND_GRAY};
`;

const ContentDiv = styled.div<{ color: string | undefined }>`
  width: ${MagicNumber.FEED_SECTION_WIDTH};
  height: calc(100% - ${MagicNumber.HEADER_HEIGHT});
  position: relative;
  background-color: ${(props) => props.color ?? Palette.GRAY};
  margin: auto;
  padding: 20px;
`;
