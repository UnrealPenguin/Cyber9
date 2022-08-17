import styled from "styled-components";
import { device } from "./GlobalStyles";

export const StyledButton = styled.button`
    color: ${({ color }) => color ? color : "white"};
    margin: ${({ margin }) => margin ? margin : "0 auto"};
    padding: 0;
    background: none;
	border: none;
    outline: inherit;
	cursor: ${({ cursor }) => cursor ? cursor : "pointer"};
    font-family: ${({ font }) => font ? font : ""};
    font-size: ${({ size }) => size? size : "inherit"};
    height: ${({ H }) => H ? H : ""};
    width: ${({ W }) => W ? W : ""};
    background-color: ${({ bgColor }) => bgColor ? bgColor : ""};
    display: flex;
    justify-content: center;
    align-items: center;
    letter-spacing: ${({ spacing }) => spacing ? spacing : ""}; 

    &:hover{
        color: ${({ hoverColor }) => hoverColor ? hoverColor : ""};
    }
    
    :disabled{
        cursor: default;
        background-color: ${({ bgDisabled }) => bgDisabled ? 'rgba(136,136,136, 0.8)' : ""};
        color: ${({ colorDisabled }) => colorDisabled ? 'rgba(169,169,169, 0.8)' : ""};
    }

    @media ${device.laptop} {
        font-size: ${({ laptopFont }) => laptopFont ? laptopFont : ""}
    }

    @media ${device.tablet} {
        width: ${({ tabletW }) => tabletW ? tabletW : ""};
        height: ${({ tabletH }) => tabletH ? tabletH : ""};
        font-size: ${({ tabletFont }) => tabletFont ? tabletFont : ""};
    }
`