interface ILang {
    [l: string]: {
        translation: {
            [key: string]: string
        }
    };
}

export const Language: ILang = {
    en: {
        translation: {
            SKILL_NAME: 'Is it safe?',
            LAUNCH_MESSAGE: '',
            HELP_MESSAGE: '',
            HELP_REPROMPT: '',
            ERROR_MESSAGE: 'Sorry, I didn\'t understand that request.',
            STOP_MESSAGE: 'Goodbye.'
        }
    }
};
