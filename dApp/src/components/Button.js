import React from 'react'
import { StyledButton } from './styles/Button.style';

const Button = ({ color, text, onClick , disabled, cursor, hoverColor, font, W, H,
        bgColor, size, bgDisabled, colorDisabled, tabletW, tabletH, laptopW, laptopH, margin,
        tabletFont, laptopFont, spacing, pEvent
    }) => {

    return (
        <StyledButton W={W} H={H} color={color} disabled={disabled} cursor={cursor} 
            onClick={onClick} hoverColor={hoverColor} font={font}
            bgColor={bgColor} size={size} bgDisabled={bgDisabled}
            colorDisabled={colorDisabled} tabletW={tabletW} tabletH={tabletH}
            laptopW={laptopW} laptopH={laptopH} margin={margin} tabletFont={tabletFont}
            laptopFont={laptopFont} spacing={spacing} pEvent={pEvent}
        >
            {text}
        </StyledButton>
    )
}

export default Button;
