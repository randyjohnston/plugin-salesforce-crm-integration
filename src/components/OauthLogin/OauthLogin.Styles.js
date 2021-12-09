// eslint-disable-next-line import/no-extraneous-dependencies
import { styled } from '@twilio/flex-ui';

export const Button = styled('div')`
  padding: 0 16px;
  border: none;
  background: linear-gradient(to top, rgb(25, 118, 210), rgb(25, 118, 210));
  outline: none;
  align-self: bottom;
  height: 28px;
  line-height: 28px;
  font-size: 10px;
  font-weight: bold;
  letter-spacing: 2px;
  white-space: nowrap;
  border-radius: 100px;
  color: rgb(255, 255, 255);
  text-transform: uppercase;
  cursor: pointer;
  &:hover {
    background-color: rgba(0, 0, 0, 0.2);
    background-blend-mode: color;
  }
`;
