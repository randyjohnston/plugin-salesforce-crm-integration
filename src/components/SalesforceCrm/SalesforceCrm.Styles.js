import styled from 'react-emotion';

export const CustomCRMContainer = styled('div')`
  text-align: center;
  display: flex;
  flex: 1 1;
  border-left: 1px solid ${(props) => props.theme.AgentDesktopView.ContentSplitter.borderColor};
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

export const Label = styled('div')`
  color: ${(props) => props.theme.colors.base7};
  letter-spacing: 2px;
  margin: 10px 12px 4px;
`;

export const Value = styled('div')`
  color: ${(props) => props.theme.colors.base8};
`;

export const Header = styled('div')`
  font-size: 12px;
  font-weight: bold;
  font-style: normal;
  font-stretch: normal;
  line-height: normal;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin: 0px 12px 4px;
`;

export const HeaderLine = styled('div')`
  border-style: solid;
  border-width: 0px 0px 4px;
  border-color: ${(props) => props.theme.colors.flexBlueColor};
  margin: 0 0 20px;
`;
