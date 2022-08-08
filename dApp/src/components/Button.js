import React from 'react'
import { StyledButton } from './styles/Button.style';

const Button = ({ color, text, onClick , disabled, cursor, hoverColor, font, W, H,
        bgColor, size, bgDisabled, colorDisabled, tabletW, tabletH, laptopW, laptopH,
    }) => {

    return (
        <StyledButton W={W} H={H} color={color} disabled={disabled} cursor={cursor} 
            onClick={onClick} hoverColor={hoverColor} font={font}
            bgColor={bgColor} size={size} bgDisabled={bgDisabled}
            colorDisabled={colorDisabled} tabletW={tabletW} tabletH={tabletH}
            laptopW={laptopW} laptopH={laptopH}
        >
            {text}
        </StyledButton>
    )
}

export default Button;
