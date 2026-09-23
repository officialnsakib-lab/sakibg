@echo off
echo Creating folder structure...

mkdir "app\(auth)\login" 2>nul
mkdir "app\(auth)\register" 2>nul
mkdir "app\(auth)\vendor-register" 2>nul
mkdir "app\(vendor)\dashboard" 2>nul
mkdir "app\(vendor)\products\upload" 2>nul
mkdir "app\(vendor)\products\edit" 2>nul
mkdir "app\(vendor)\websites\upload" 2>nul
mkdir "app\(vendor)\orders" 2>nul
mkdir "app\(vendor)\earnings" 2>nul
mkdir "app\(admin)\dashboard" 2>nul
mkdir "app\(admin)\approvals\products" 2>nul
mkdir "app\(admin)\approvals\websites" 2>nul
mkdir "app\(admin)\vendors" 2>nul
mkdir "app\(admin)\commission" 2>nul
mkdir "app\(admin)\reports" 2>nul
mkdir "app\api\auth\register" 2>nul
mkdir "app\api\auth\login" 2>nul
mkdir "app\api\products\upload" 2>nul
mkdir "app\api\products\my-products" 2>nul
mkdir "app\api\websites\upload" 2>nul
mkdir "app\api\websites\my-websites" 2>nul
mkdir "app\api\admin\pending-products" 2>nul
mkdir "app\api\admin\pending-websites" 2>nul
mkdir "app\api\admin\approve-product" 2>nul
mkdir "app\api\admin\approve-website" 2>nul
mkdir "app\api\admin\commission" 2>nul
mkdir "app\api\admin\stats" 2>nul
mkdir "app\api\orders\create" 2>nul
mkdir "app\api\orders\my-orders" 2>nul
mkdir "app\api\orders\vendor-orders" 2>nul
mkdir "components\layout" 2>nul
mkdir "components\product" 2>nul
mkdir "components\website" 2>nul
mkdir "components\forms" 2>nul
mkdir "components\dashboard" 2>nul
mkdir "components\ui" 2>nul
mkdir "lib" 2>nul
mkdir "models" 2>nul
mkdir "types" 2>nul

echo.
echo ✅ All folders created successfully!
pause