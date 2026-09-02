from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status

User = get_user_model()

class AuthTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='ayesha', password='yasha1234', role='ADMIN'
        )

    def test_login_success(self):
        response = self.client.post('/api/token/', {
            'username': 'ayesha', 'password': 'yasha1234'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_login_wrong_password(self):
        response = self.client.post('/api/token/', {
            'username': 'ayesha', 'password': 'wrong'
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_requires_token(self):
        response = self.client.get('/api/me/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_with_valid_token(self):
        login = self.client.post('/api/token/', {
            'username': 'ayesha', 'password': 'yasha1234'
        })
        token = login.data['access']
        response = self.client.get(
            '/api/me/', HTTP_AUTHORIZATION=f'Bearer {token}'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'ayesha')