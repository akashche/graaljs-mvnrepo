#!/usr/lib/jvm/java-1.8.0/bin/jjs

/*
 * Copyright 2017, akashche at redhat.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var arrays = Packages.java.util.Arrays;
var files = Packages.java.nio.file.Files;
var paths = Packages.java.nio.file.Paths;
var system = Packages.java.lang.System;
var ProcessBuilder = Packages.java.lang.ProcessBuilder;

if (2 !== arguments.length) {
    print("Error: invalid arguments");
    print("Usage: jjs mvninstall.js -- <path/to/dir> <version>");
    system.exit(1);
}

var groupId = "io.github.ojdkbuild.graalvm";
var version = arguments[1];
var cwd = __DIR__.replaceAll("\\\\", "/");

function walkAndSign(dirpath) {
    var st = files.newDirectoryStream(dirpath);
    for each (pa in st) {
        var name = pa.getFileName().toString();
        if (files.isDirectory(pa)) {
            walkAndSign(pa);
        } else if(files.isRegularFile(pa) &&
                "dists".equals(pa.getParent().getFileName().toString()) && 
                name.endsWith(".jar") &&
                !name.matches("^.*(test|benchmark|junit|jacoco).*$")) {
            print("Installing: [" + name + "]");
            var abspath = pa.toAbsolutePath().toString();
            new ProcessBuilder(
                    "c:/windows/system32/cmd.exe",
                    "/c",
                    cwd + "maven/bin/mvn.cmd",
                    "install:install-file",
                    "-DgroupId=" + groupId,
                    "-DartifactId=" + name.substr(0, name.length - 4),
                    "-Dversion=" + version,
                    "-Dpackaging=jar",
                    "-DcreateChecksum=true",
                    "-Dfile=" + abspath
                    ).inheritIO().start().waitFor();
            new ProcessBuilder(
                    "c:/windows/system32/cmd.exe",
                    "/c",
                    cwd + "maven/bin/mvn.cmd",
                    "install:install-file",
                    "-DgroupId=" + groupId,
                    "-DartifactId=" + name.substr(0, name.length - 4),
                    "-Dversion=" + version,
                    "-Dpackaging=jar",
                    "-Dclassifier=sources",
                    "-DcreateChecksum=true",
                    "-Dfile=" + abspath.substr(0, abspath.length - 4) + ".src.zip"
                    ).inheritIO().start().waitFor();
        }
    }
    st.close();
}

walkAndSign(paths.get(arguments[0]));
