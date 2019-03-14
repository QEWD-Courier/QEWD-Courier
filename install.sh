#!/usr/bin/env bash

RED='\033[0;31m'
Green='\033[0;32m'
NC='\033[0m' # No Color

printf 'Please enter domain name or IP: '
read domainName

echo '    1.Helm-RA'
echo '    2.Helm-ReactJS'
echo '    3.Scotland-RA'
echo '    4.Showcase-RA'
echo '    5.Showcase-ReactJS'
printf 'Please choose UI Project: '
read numberFront
nginxPath=''
case $numberFront in
    1)
        printf "${Green} O1.Helm-RA${NC} \n"
        nginxPath='\/usr\/share\/nginx\/html\/Helm-RA'
        ;;
    2)
        printf "${Green}O2.Helm-ReactJS${NC} \n"
        nginxPath='\/usr\/share\/nginx\/html\/Helm-ReactJS'
        ;;
    3)
        printf "${Green}O3.Scotland-RA${NC} \n"
        nginxPath='\/usr\/share\/nginx\/html\/Scotland-RA'
        ;;
    4)
        printf "${Green}O4.Showcase-RA${NC} \n"
        nginxPath='\/usr\/share\/nginx\/html\/Showcase-RA'
        ;;
    5)
        printf "${Green}O5.Showcase-ReactJS${NC} \n"
        nginxPath='\/usr\/share\/nginx\/html\/Showcase-ReactJS'
        ;;
    *)
        echo 'Please choose one of the UI projects !'
        exit 1
        ;;
esac

arrFile=();
arrFile+=('nginx/conf.d/domains.conf.dist')
arrFile+=('helm/configuration/global_config.json.dist')
arrFile+=('oidc_provider/settings/configuration.json.dist')

for file in ${arrFile[*]}
do
    sed -e "s/{{domainName}}/${domainName}/g" $file | sed -e "s/{{webPath}}/${nginxPath}/g" > ${file%.dist}
    printf "${file%.dist} ....... ${Green}OK${NC} \n"

done
