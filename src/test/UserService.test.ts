/// <reference types="jest" />
import { userService } from "../services/userService"
import { User, UserDocument } from "../models/user";
import { UserInterface } from "@projeto/shared/interfaces/user";
import {ApiError} from "../utils/ApiError";
import { Product } from "../models/product";

jest.mock("../models/user");
jest.mock("../models/product");

let mockUser = User as jest.Mocked<typeof User>;

const fakeUser = {
    _id: "1234567890",
    name: "John Doe",
    email: "test@gmail.com",
    password: "password123",
    role: "admin",
}

describe("UserService.registerUser", () => {
    beforeEach(() => {
        // mockUserService = userService as jest.Mocked<typeof userService>;
        jest.clearAllMocks();    
    });

    it("userService.registerUser - Cria usuário se não tiver um", async () => {
        mockUser.findOne.mockResolvedValue(null); //Emular que o email não existe

        mockUser.create.mockResolvedValue(fakeUser as any);
         //Emular a criação do usuário
        
        const result = await userService.registerUser(fakeUser)
        
        expect(mockUser.findOne).toHaveBeenCalledWith({ email: fakeUser.email });
        expect(mockUser.create).toHaveBeenCalledWith(fakeUser);
        expect(result).toEqual(fakeUser);
    });

    it("userService.registerUser - Se existir usuário, retorna erro", async () => {
        mockUser.findOne.mockResolvedValue({email: fakeUser.email} as UserDocument);
        mockUser.create.mockResolvedValue(fakeUser as any);

        await expect(userService.registerUser(fakeUser)).rejects.toThrow(new ApiError(409, "E-mail já em uso"));

        expect(mockUser.create).not.toHaveBeenCalled();
    });
});

describe("UserService.enterUser", () => {});

describe("UserService.findById", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });


    it("userService.findById - Retorna usuário se encontrado", async () => {
        const selectMock = jest.fn().mockResolvedValue(fakeUser as any); //Emula a ultima chamada do findById, .select()
        const orFailMock = jest.fn().mockReturnValue({select: selectMock}); //Emula a chamada do meio, .orFail(), que retorna um objeto com o método .select()
        
        mockUser.findById.mockReturnValue({ orFail: orFailMock } as any); //Emula a primeira chamada, .findById(), que retorna um objeto com o método .orFail().
        
        const result = await userService.findById(fakeUser._id as any);

        expect(result).toEqual(fakeUser);
        expect(mockUser.findById).toHaveBeenCalledWith(fakeUser._id);
        expect(orFailMock).toHaveBeenCalled();
        expect(selectMock).toHaveBeenCalledWith("-password");
    });
    
    it("userService.findById - Retorna erro se usuário não encontrado", async () => {
        const orFailMock = jest.fn().mockImplementation(() => { throw new ApiError(404, "Usuário não encontrado") });

        mockUser.findById.mockReturnValue({orFail: orFailMock} as any);

        await expect(userService.findById(fakeUser._id)).rejects.toThrow(new ApiError(404, "Usuário não encontrado"));

        expect(mockUser.findById).toHaveBeenCalledWith(fakeUser._id);
        expect(orFailMock).toHaveBeenCalled();
    });
});

describe("userService.deleteUserById", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    
    it("deleteUserById - Delete usuário se encontrado", async () => {
        const orFailMock = jest.fn().mockReturnValue(fakeUser as any); //Emula a chamada do meio, .orFail(), que retorna o usuário encontrado.

        mockUser.findByIdAndDelete.mockReturnValue({orFail: orFailMock} as any);
        
        await expect(userService.deleteUserById(fakeUser._id as any)).resolves.not.toThrow();
        
        expect(mockUser.findByIdAndDelete).toHaveBeenCalledWith(fakeUser._id);
        expect(orFailMock).toHaveBeenCalled();
    });
    it("deleteUserById - Retorna erro se usuário não encontrado", async () => {
        const orFailMock = jest.fn().mockImplementation(() => {
            throw new ApiError(404, "Usuário não encontrado")
        });    

        mockUser.findByIdAndDelete.mockReturnValue({orFail: orFailMock} as any);

        await expect(userService.deleteUserById(fakeUser._id as any))
            .rejects
            .toThrow(new ApiError(404, "Usuário não encontrado"));
    
        expect(mockUser.findByIdAndDelete).toHaveBeenCalledWith(fakeUser._id);
        expect(orFailMock).toHaveBeenCalled();
    });
});

describe("userService.updatedById", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("updatedById - Atualiza usuário se encontrado", async () => {
        const selectMock = jest.fn().mockResolvedValue(fakeUser as any); //Emula a ultima chamada do findById, .select()
        const orFailMock = jest.fn().mockReturnValue({select: selectMock}); //Emula a chamada do meio, .orFail(), que retorna um objeto com o método .select()
        
        mockUser.findByIdAndUpdate.mockReturnValue({ orFail: orFailMock } as any); //Emula a primeira chamada, .findByIdAndUpdate(), que retorna um objeto com o método .orFail().
    
        const result = await userService.updatedById(fakeUser._id as any, fakeUser as UserInterface);
        
        expect(result).toEqual(fakeUser);
        expect(mockUser.findByIdAndUpdate).toHaveBeenCalledWith(fakeUser._id, fakeUser, { new: true });
        expect(orFailMock).toHaveBeenCalled();
        expect(selectMock).toHaveBeenCalledWith("-password");
    });

    it("updatedById - Retorna erro se usuário não encontrado", async () => {
        const orFailMock = jest.fn().mockImplementation(() => {
            throw new ApiError(404, "Usuário não encontrado")
        });

        mockUser.findByIdAndUpdate.mockReturnValue({orFail: orFailMock} as any);

        await expect(userService.updatedById(fakeUser._id as any, fakeUser as UserInterface))
            .rejects
            .toThrow(new ApiError(404, "Usuário não encontrado"));

        expect(mockUser.findByIdAndUpdate).toHaveBeenCalledWith(fakeUser._id, fakeUser, { new: true });
        expect(orFailMock).toHaveBeenCalled();
    });
});

describe("userService.listProductsByUserId", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const productMock = Product as jest.Mocked<typeof Product>;

    it("listProductByUserId - Lista todos os produtos", async () => {
        const products = [
            {
                _id: "prod1",
                name: "Produto 1",
                description: "Descrição do Produto 1",
                price: 100,
                userCreate: fakeUser._id,
                createdAt: new Date(),
            }
        ]
        const sortMock = jest.fn().mockResolvedValue(products); //Emula a ultima chamada do findById, .select()

        productMock.find.mockReturnValue({ sort: sortMock } as any); //Emula a primeira chamada, .find(), que retorna um objeto com o método .sort().

        const result = await userService.listProductsByUserId(fakeUser._id as any);

        expect(result).toEqual(products);
        expect(productMock.find).toHaveBeenCalledWith({userCreate: fakeUser._id});
        expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
    });

    it("listProductByUserId - Retorna erro se usuário não encontrado", async () => {
        const sortMock = jest.fn().mockReturnValue([]); //Emula a ultima chamada do find(), .sort()

        productMock.find.mockReturnValue({ sort: sortMock } as any); //Emula a primeira chamada, .find(), que retorna um objeto com o método .sort().

        await expect(userService.listProductsByUserId(fakeUser._id as any))
             .rejects
             .toThrow(new ApiError(404, "Não existe produto cadastrado no seu usuário"));

        expect(productMock.find).toHaveBeenCalledWith({userCreate: fakeUser._id});
        expect(sortMock).toHaveBeenCalled();
    });
})