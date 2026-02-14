def check_password(password):
    print(f"\n🔍 Testing password: {password}")
    print("=" * 40)
    
    length = len(password) >= 8
    uppercase = any(c.isupper() for c in password)
    number = any(c.isdigit() for c in password)
    
    print(f"8+ characters: {'✅' if length else '❌'} ({len(password)} chars)")
    print(f"Uppercase: {'✅' if uppercase else '❌'}")
    print(f"Number: {'✅' if number else '❌'}")
    
    if length and uppercase and number:
        print("\n✅✅✅ VALID PASSWORD! ✅✅✅")
    else:
        print("\n❌❌❌ INVALID PASSWORD! ❌❌❌")
        if not length:
            print("   - Need at least 8 characters")
        if not uppercase:
            print("   - Need at least one uppercase letter (A-Z)")
        if not number:
            print("   - Need at least one number (0-9)")

# Test your password
check_password("12345678S")  # Your current password
print()
check_password("Shoaib123456")  # ✅ This will work
print()
check_password("FoodCompany2026")  # ✅ This will work