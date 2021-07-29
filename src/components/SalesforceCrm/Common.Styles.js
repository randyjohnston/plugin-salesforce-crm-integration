import styled from 'react-emotion';

export const Label = styled('div')`
  color: ${(props) => props.theme.colors.base7};
  letter-spacing: 2px;
`;

export const Value = styled('div')`
  color: ${(props) => props.theme.colors.base8};
`;

export const Header = styled('div')`
  font-size: 10px;
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
