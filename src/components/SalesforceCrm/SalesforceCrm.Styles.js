import styled from 'react-emotion';

export const CustomCRMContainer = styled('div')`
  text-align: center;
  display: flex;
  flex: 1 1;
  border-left: 1px solid
    ${(props) => props.theme.AgentDesktopView.ContentSplitter.borderColor};
  background-color: ${(props) => props.theme.TaskCanvas.Container.background};
`;

export const ProfileCanvas = styled('div')`
  color: ${(props) => props.theme.calculated.textColor};
  align-items: center;
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  justify-content: center;
`;

export const ProfileGrid = styled('div')`
  display: grid;
  grid-template-columns: auto auto;
  column-gap: 5vw;
  row-gap: 20px;
`;

export const ProfilePhoto = styled('img')`
  border-radius: 50%;
  height: 200px;
  width: 200px;
  margin: 0 12px 34px;
`;

export const LargeCaption = styled('div')`
  font-size: 24px;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-align: center;
  margin: 10px 0 40px;
`;
