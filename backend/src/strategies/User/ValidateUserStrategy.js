class ValidateUserStrategy {
    static async execute(data) {
        try {
            const missingFields = ['type', 'name', 'email', 'password'].filter(field => !(field in data));

            if (missingFields.length > 0) {
                throw new Error(`Os seguintes campos estão faltando: ${missingFields.join(', ')}.`);
            }

            if ([data.type, data.name, data.email, data.password].some(v => v === undefined || v === null || v === '')) {
                throw new Error('Todos os campos obrigatórios devem estar preenchidos.');
            }

            if (typeof data.type !== 'string') {
                throw new Error('O campo "Tipo do Usuário" deve conter um valor válido.');
            }

            if (typeof data.name !== 'string') {
                throw new Error('O campo "Nome" deve conter uma string.');
            }

            if (typeof data.email !== 'string') {
                throw new Error('O campo "E-mail" deve conter uma string.');
            }

            if (typeof data.password !== 'string') {
                throw new Error('O campo "Senha" deve conter uma string.');
            }

            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/;
            if (!passwordRegex.test(data.password)) {
                throw new Error('A senha deve ter pelo menos 8 caracteres, incluir letras maiúsculas, minúsculas e caracteres especiais.');
            }

            if (data.cellphone && (typeof data.cellphone !== 'string' || !/^\d{11}$/.test(data.cellphone))) {
                throw new Error('O campo "Celular" deve conter uma string numérica de 11 dígitos.');
            }

            if (data.loyaltyPoints) {
                const loyaltyPoints = Number(data.loyaltyPoints);
                if (isNaN(loyaltyPoints) || loyaltyPoints < 0) {
                    throw new Error('O campo "Pontos de Fidelidade" deve conter um ano válido.');
                }
            }

            if (data.isActive) {
                const isActive = Number(data.isActive);
                if (isNaN(isActive) || ![0, 1].includes(data.isActive)) {
                    throw new Error('O campo "Usuário Ativo" deve conter um ano válido.');
                }
            }
        } catch (error) {
            throw error.message;
        }
    }
}

module.exports = ValidateUserStrategy;
