import styled from 'styled-components'

export const Container = styled.div`
  padding: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex: 1;
  flex-direction: ${props => props.row ? 'row' : 'column'};
`;

export const Item = styled.div`
  display: flex;
  flex-direction: ${props => props.row ? 'row' : 'column'};
  flex: ${(props) => props.shrink ? '0' : '1'};
`;