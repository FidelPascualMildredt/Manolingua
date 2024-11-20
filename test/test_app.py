import pytest
from app import translate_sign_language

def test_translate_sign_language():
    # Test para verificar que se traduce correctamente una seña
    result = translate_sign_language("👍")
    assert result == "Thumbs up"

def test_invalid_sign():
    # Test para verificar que se maneja correctamente una seña inválida
    result = translate_sign_language("???")
    assert result == "Invalid sign"
