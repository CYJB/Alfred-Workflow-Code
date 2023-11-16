#! /usr/bin/osascript -l JavaScript

function run(argv) {
  const path = argv[0];
  if (path) {
    const app = Application.currentApplication();
    app.includeStandardAdditions = true;

    if (path.endsWith('/')) {
      // 是文件夹，总是使用新实例。
      app.doShellScript(`"$VSC_PATH/Contents/Resources/app/bin/code" "${path}"`);
    } else {
      // 是文件，尽量复用现有实例。
      app.doShellScript(`"$VSC_PATH/Contents/Resources/app/bin/code" -r "${path}"`);
    }
  }
}
