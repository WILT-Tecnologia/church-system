const fs = require('fs');
const path = require('path');

try {
  const packageJsonPath = path.join(__dirname, 'node_modules', '@fullcalendar', 'angular', 'package.json');

  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    // Add the missing export specifiers
    if (!packageJson.exports['./full-calendar.component']) {
      packageJson.exports['./full-calendar.component'] = {
        types: './full-calendar.component.d.ts',
        esm2020: './esm2020/full-calendar.component.mjs',
        es2020: './fesm2020/fullcalendar-angular.mjs',
        es2015: './fesm2015/fullcalendar-angular.mjs',
        node: './fesm2015/fullcalendar-angular.mjs',
        default: './fesm2020/fullcalendar-angular.mjs',
      };
    }

    if (!packageJson.exports['./full-calendar.module']) {
      packageJson.exports['./full-calendar.module'] = {
        types: './full-calendar.module.d.ts',
        esm2020: './esm2020/full-calendar.module.mjs',
        es2020: './fesm2020/fullcalendar-angular.mjs',
        es2015: './fesm2015/fullcalendar-angular.mjs',
        node: './fesm2015/fullcalendar-angular.mjs',
        default: './fesm2020/fullcalendar-angular.mjs',
      };
    }

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✅ FullCalendar Angular package.json patched successfully');
  } else {
    console.log('⚠️  FullCalendar Angular package not found, skipping patch');
  }
} catch (error) {
  console.error('❌ Error patching FullCalendar Angular package:', error.message);
  // Don't fail the installation if patching fails
  process.exit(0);
}
