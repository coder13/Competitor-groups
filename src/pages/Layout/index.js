import React from 'react';
import { Outlet } from 'react-router-dom';
import styled from 'styled-components';
import Header from './Header';

const RootDiv = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  minHeight: '100vh',
});

const Main = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  height: '90vh',
});

export default function Layout() {
  return (
    <RootDiv>
      <Header />
      <Main>
        <Outlet />
      </Main>
      {/* <Footer/> */}
    </RootDiv>
  );
}
