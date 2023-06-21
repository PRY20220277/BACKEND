export class AuthModel {
  username: string;
  password: string;
}

export class Token {
  access_token: string;
  expires_in: number;
  username: string;
  id: string;
}
