import styled from "styled-components";
import { device } from "./GlobalStyles";

export const StyledContainer = styled.div`
    width: ${({ W }) => W ? W : ""};
    height: ${({ H }) => H ? H : ""};
    min-width: ${({ minW }) => minW ? minW : ""};
    min-height: ${({ minH }) => minH ? minH : ""};
    max-width: ${({ maxW }) => maxW ? maxW : ""};
    max-height: ${({ maxH }) => maxH ? maxH : ""};

    margin: ${({ margin }) => margin ? margin : ""};
    padding: ${({ padding }) => padding ? padding : ""};

    position: ${({ position }) => position ? position : ""};
    top: ${({ top }) => top ? top : ""};
    left: ${({ left }) => left ? left : ""};
    right: ${({ right }) => right ? right : ""};

    background-image: ${({ bgImg }) => bgImg ? `url(${bgImg})` : ""};
    background-image: ${({ bgGradient }) => bgGradient ? bgGradient : ""}; //for gradient
    background-color: ${({ bgColor }) => bgColor ? bgColor : ""};
    background-size: ${({bgSize}) => bgSize ? bgSize : ""};
    background-repeat: ${({ bgRepeat }) => bgRepeat ? bgRepeat : ""};
    background-position: ${({ bgPos }) => bgPos ? bgPos : ""};
    box-shadow: ${({ gradient }) => gradient ? gradient : ""}; 

    display: ${({ display }) => display ? display : ""};
    flex: ${({ flex }) => flex ? flex : ""};
    flex-direction: ${({ flexDirection }) => flexDirection ? flexDirection : ""};
    flex-wrap: ${({ flexWrap }) => flexWrap ? flexWrap : ""};
    justify-content: ${({ justify }) => justify ? justify : ""};
    align-items: ${({ alignItems }) => alignItems ? alignItems : ""};
    align-content: ${({ alignContent }) => alignContent ? alignContent : ""}; 

    z-index: ${({ index }) => index ? index : ""};
    border-bottom: ${({ borderBot }) => borderBot ? borderBot : ""};
    border-top: ${({ borderTop }) => borderTop ? borderTop : ""};
    border-radius: ${({ borderRadius }) => borderRadius ? borderRadius : ""};
    text-align: center;
    opacity: ${({ opacity }) => opacity ? opacity : ""};
    border: ${({ border }) => border ? border : ""};

    &:hover{
        box-shadow: ${({ highlight }) => highlight ? highlight : ""};
        border: ${({ borderHover }) => borderHover? borderHover : ""};
    }

    @media ${device.laptop} {
        width: ${({ laptopW }) => laptopW ? laptopW : ""};
        height: ${({ laptopH }) => laptopH ? laptopH : ""};
        padding: ${({ laptopPad }) => laptopPad ? laptopPad : ""};
        margin: ${({ laptopMargin }) => laptopMargin ? laptopMargin : ""}; 
        background-position: ${({ laptopBgPos }) => laptopBgPos ? laptopBgPos : ""};
        
        top: ${({ topLaptop }) => topLaptop ? topLaptop : ""};
        left: ${({ leftLaptop }) => leftLaptop ? leftLaptop : ""};
        right: ${({ rightLaptop }) => rightLaptop ? rightLaptop : ""};
    }

    @media ${device.tablet} { 
        width: ${({ tabletW }) => tabletW ? tabletW : ""};
        height: ${({ tabletH }) => tabletH ? tabletH : ""};
        padding: ${({ tabletPad }) => tabletPad ? tabletPad : ""};
        margin: ${({ tabletMargin }) => tabletMargin ? tabletMargin : ""}; 
        background-position: ${({ tabletBgPos }) => tabletBgPos ? tabletBgPos : ""};
    }

    @media ${device.mobileL} {
        width: ${({ mobileLW }) => mobileLW ? mobileLW : ""};
        height: ${({ mobileLH }) => mobileLH ? mobileLH : ""};
        padding: ${({ mobileLpad }) => mobileLpad ? mobileLpad : ""};
        margin: ${({ mobileLMargin }) => mobileLMargin ? mobileLMargin : ""}; 
        background-position: ${({ mobileLBgPos }) => mobileLBgPos ? mobileLBgPos : ""};
        
        top: ${({ topMobileL }) => topMobileL ? topMobileL : ""};
        left: ${({ leftMobileL }) => leftMobileL ? leftMobileL : ""};
        right: ${({ rightMobileL }) => rightMobileL ? rightMobileL : ""};

        transform: ${({ transformMobileL }) => transformMobileL ? transformMobileL : ""};
    }
`

export const StyledParagraph = styled.p`
    white-space: ${({ whiteSpace }) => whiteSpace ? whiteSpace : 'pre-line'};
    width: ${({ W }) => W ? W : ""};
    height: ${({ H }) => H ? H : ""};
    font-family: ${({ font }) => font ? font : ""};
    font-size: ${({ size }) => size ? size : ""};
    letter-spacing: ${({ spacing }) => spacing ? spacing : ""}; 
    text-align: ${({ align }) => align ? align : ""};
    color: ${({ color }) => color ? color : ""};
    margin: ${({ margin }) => margin ? margin : ""};
    padding: ${({ padding }) => padding ? padding : ""};

    display: ${({ display }) => display ? display : ""};
    justify-content: ${({ justify }) => justify ? justify : ""};
    align-items: ${({ alignItems }) => alignItems ? alignItems : ""};
    opacity: ${({ opacity }) => opacity ? opacity : ""};

    position: ${({ position }) => position ? position : ""};
    top: ${({ top }) => top ? top : ""};
    left: ${({ left }) => left ? left : ""};
    transform: ${({ transform }) => transform ? transform : ""};
    user-select: ${({ select }) => select ? select : ""};
    line-height: ${({ lineHeight }) => lineHeight ? lineHeight : ""};
    
    overflow: hidden;
    word-break: break-word;
`

export const StyledImage = styled.img`
    src: ${({ source }) => source};
    background-position: ${({ bgPosition }) => (bgPosition ? bgPosition : "")};
    background-size: contain;
    width: ${({ W }) => (W ? W : "")};
    min-width: ${({ minW }) => minW ? minW : ""};
    height: ${({ H }) => (H ? H : "")};
    margin: ${({ margin }) => margin ? margin : ""};
    opacity: ${({ opacity }) => opacity ? opacity : ""};
    flex: ${({ flex }) => flex ? flex : ""};
    max-width: ${({ maxW }) => maxW ? maxW : ""};
    border-radius: ${({ borderRadius }) => borderRadius ? borderRadius : ""};
    border: ${({ border }) => border ? border : ""};

    @media ${device.laptop} {
        width: ${({ laptopW }) => laptopW ? laptopW : ""};
        height: ${({ laptopH }) => laptopH ? laptopH : ""};
        padding: ${({ laptopPad }) => laptopPad ? laptopPad : ""};
        margin: ${({ laptopMargin }) => laptopMargin ? laptopMargin : ""}; 
    }
    
    @media ${device.tablet} { 
        width: ${({ tabletW }) => tabletW ? tabletW : ""};
        height: ${({ tabletH }) => tabletH ? tabletH : ""};
        padding: ${({ tabletPad }) => tabletPad ? tabletPad : ""};
        margin: ${({ tabletMargin }) => tabletMargin ? tabletMargin : ""}; 
    }

    @media ${device.mobileL} {
        width: ${({ mobileLW }) => mobileLW ? mobileLW : ""};
        height: ${({ mobileLH }) => mobileLH ? mobileLH : ""};
        padding: ${({ mobileLPad }) => mobileLPad ? mobileLPad : ""};
        margin: ${({ mobileLMargin }) => mobileLMargin ? mobileLMargin : ""}; 
    }

`

export const StyledUl = styled.ul`
    margin-left: ${({ mLeft }) => mLeft ? mLeft : ""};

    display: ${({ display }) => display ? display : ""};
    flex-direction: ${({ flexDirection }) => flexDirection ? flexDirection : ""};
    flex-wrap: ${({ flexWrap }) => flexWrap ? flexWrap : ""};
    justify-content: ${({ justify }) => justify ? justify : ""};
    align-items: ${({ alignItems }) => alignItems ? alignItems : ""};
    align-content: ${({ alignContent }) => alignContent ? alignContent : ""}; 

`

export const StyledLi = styled.li`
    margin: ${({ margin }) => margin ? margin : ""};
    padding: ${({ padding }) => padding ? padding : ""};
`